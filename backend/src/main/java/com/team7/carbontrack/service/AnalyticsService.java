package com.team7.carbontrack.service;

import com.team7.carbontrack.dto.CategoryEmission;
import com.team7.carbontrack.dto.DailyEmission;
import com.team7.carbontrack.dto.DashboardSummary;
import com.team7.carbontrack.dto.ActivityLogResponse;
import com.team7.carbontrack.dto.RecommendationInsight;
import com.team7.carbontrack.entity.ActivityCategory;
import com.team7.carbontrack.repository.ActivityLogRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.team7.carbontrack.entity.UserStreak;
import com.team7.carbontrack.repository.UserStreakRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ActivityLogRepository activityLogRepository;
    private final RecommendationService recommendationService;
    private final GoalService goalService;
    private final UserStreakRepository userStreakRepository;

    public AnalyticsService(ActivityLogRepository activityLogRepository,
                            RecommendationService recommendationService,
                            GoalService goalService,
                            UserStreakRepository userStreakRepository) {
        this.activityLogRepository = activityLogRepository;
        this.recommendationService = recommendationService;

        this.goalService = goalService;
        this.userStreakRepository = userStreakRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(
            value = "dashboardSummary",
            key = "#userId + ':' + T(java.time.LocalDate).now()",
            sync = true
    )
    public DashboardSummary getDashboardSummary(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);
        LocalDate thirtyDaysAgo = today.minusDays(29);

        // 1. Current carbon sums
        //BigDecimal todayCo2e = sumEmissions(activityLogRepository.findByUserIdAndLogDateBetween(userId, today, today));
        //BigDecimal weeklyCo2e = sumEmissions(activityLogRepository.findByUserIdAndLogDateBetween(userId, sevenDaysAgo, today));
       // BigDecimal monthlyCo2e = sumEmissions(activityLogRepository.findByUserIdAndLogDateBetween(userId, thirtyDaysAgo, today));
        // 1. Current carbon sums using JPQL aggregation queries ( milestone 2)
        BigDecimal todayCo2e = activityLogRepository
                .getTotalEmissions(userId, today, today)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal weeklyCo2e = activityLogRepository
                .getTotalEmissions(userId, sevenDaysAgo, today)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal monthlyCo2e = activityLogRepository
                .getTotalEmissions(userId, thirtyDaysAgo, today)
                .setScale(2, RoundingMode.HALF_UP);

        // 2. Category-wise breakdown
        List<CategoryEmission> categoryBreakdown = activityLogRepository.getEmissionsByCategory(userId, thirtyDaysAgo, today);
        // Ensure all categories exist in the list (even if 0)
        Map<ActivityCategory, BigDecimal> breakdownMap = new EnumMap<>(ActivityCategory.class);
        for (ActivityCategory cat : ActivityCategory.values()) {
            breakdownMap.put(cat, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }
        for (CategoryEmission ce : categoryBreakdown) {
            breakdownMap.put(ce.category(), ce.totalCo2e().setScale(2, RoundingMode.HALF_UP));
        }
        List<CategoryEmission> completeBreakdown = breakdownMap.entrySet().stream()
                .map(e -> new CategoryEmission(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // 3. Trends (This week vs last week)
        List<DailyEmission> thisWeekTrend = fillMissingDates(
                activityLogRepository.getDailyEmissions(userId, sevenDaysAgo, today),
                sevenDaysAgo, today
        );
        LocalDate fourteenDaysAgo = today.minusDays(13);
        LocalDate eightDaysAgo = today.minusDays(7);
        List<DailyEmission> lastWeekTrend = fillMissingDates(
                activityLogRepository.getDailyEmissions(userId, fourteenDaysAgo, eightDaysAgo),
                fourteenDaysAgo, eightDaysAgo
        );

        // 4. Recent activities
        List<ActivityLogResponse> recentActivities = activityLogRepository
                .findByUserIdOrderByLogDateDesc(userId, PageRequest.of(0, 10))
                .map(ActivityLogResponse::from)
                .getContent();

        // 5. Recommendations
        List<String> recommendations = recommendationService.getPersonalizedRecommendations(userId);
        List<RecommendationInsight> recommendationInsights = recommendationService.getRecommendationInsights(userId);
        //List<String> recommendations = List.of();


        // 6. Peer Benchmarking Percentile
        List<Object[]> userTotals = activityLogRepository.getUserTotalEmissions(thirtyDaysAgo);
        double userEmission = 0.0;
        int worseCount = 0;
        int totalActive = userTotals.size();
        for (Object[] row : userTotals) {
            Long uid = (Long) row[0];
            double total = ((Number) row[1]).doubleValue();
            if (uid.equals(userId)) {
                userEmission = total;
            }
        }
        for (Object[] row : userTotals) {
            double total = ((Number) row[1]).doubleValue();
            if (total > userEmission) {
                worseCount++;
            }
        }
        double percentileRank = totalActive > 0 ? ((double) worseCount / totalActive) * 100.0 : 100.0;
        // Format to 1 decimal place
        percentileRank = Math.round(percentileRank * 10.0) / 10.0;

        // 7. Platform Category Averages
        List<CategoryEmission> platformAverages = activityLogRepository.getPlatformCategoryAverages(thirtyDaysAgo);
        Map<String, BigDecimal> categoryAverages = new HashMap<>();
        for (ActivityCategory cat : ActivityCategory.values()) {
            categoryAverages.put(cat.name(), BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }
        for (CategoryEmission ce : platformAverages) {
            categoryAverages.put(ce.category().name(), ce.totalCo2e().setScale(2, RoundingMode.HALF_UP));
        }

        // 8. Active Goal
        DashboardSummary.ActiveGoalProgress activeGoal = goalService.getActiveGoalProgress(userId);
       // DashboardSummary.ActiveGoalProgress activeGoal = null;

        UserStreak streak = userStreakRepository.findById(userId)
                .orElse(null);

        Integer currentStreak = (streak != null) ? streak.getCurrentStreak() : 0;
        Integer longestStreak = (streak != null) ? streak.getLongestStreak() : 0;


        return new DashboardSummary(
                todayCo2e,
                weeklyCo2e,
                monthlyCo2e,

                currentStreak,
                longestStreak,

                completeBreakdown,
                thisWeekTrend,
                lastWeekTrend,
                recentActivities,
                recommendations,
                recommendationInsights,
                percentileRank,
                categoryAverages,
                activeGoal
        );
    }

    //private BigDecimal sumEmissions(List<com.team7.carbontrack.entity.ActivityLog> logs) {
       // return logs.stream()
              //  .map(com.team7.carbontrack.entity.ActivityLog::getCo2eKg)
               // .reduce(BigDecimal.ZERO, BigDecimal::add)
                //.setScale(2, RoundingMode.HALF_UP);
   // }

    private List<DailyEmission> fillMissingDates(List<DailyEmission> existing, LocalDate start, LocalDate end) {
        Map<LocalDate, BigDecimal> map = new HashMap<>();
        for (DailyEmission de : existing) {
            map.put(de.logDate(), de.totalCo2e());
        }

        List<DailyEmission> filled = new ArrayList<>();
        LocalDate curr = start;
        while (!curr.isAfter(end)) {
            BigDecimal value = map.getOrDefault(curr, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            filled.add(new DailyEmission(curr, value));
            curr = curr.plusDays(1);
        }
        return filled;
    }
}
