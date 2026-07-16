package com.team7.carbontrack.controller;

import com.team7.carbontrack.dto.LeaderboardEntry;
import com.team7.carbontrack.entity.ActivityCategory;
import com.team7.carbontrack.entity.ActivityLog;
import com.team7.carbontrack.entity.Badge;
import com.team7.carbontrack.entity.User;
import com.team7.carbontrack.repository.ActivityLogRepository;
import com.team7.carbontrack.repository.UserRepository;
import com.team7.carbontrack.service.BadgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BadgeService badgeService;

    public LeaderboardController(UserRepository userRepository,
                                 ActivityLogRepository activityLogRepository,
                                 BadgeService badgeService) {
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.badgeService = badgeService;
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard() {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(29);
        List<Object[]> userTotals = activityLogRepository.getUserTotalEmissions(thirtyDaysAgo);

        // Map userId to total emissions in last 30 days
        Map<Long, Double> emissionMap = new HashMap<>();
        for (Object[] row : userTotals) {
            emissionMap.put((Long) row[0], ((Number) row[1]).doubleValue());
        }

        // Fetch all users to construct leaderboard
        List<User> users = userRepository.findAll();

        List<LeaderboardEntry> entries = new ArrayList<>();
        for (User u : users) {
            String displayName = u.getUsername();
            if (u.getGoalVisibility() == com.team7.carbontrack.entity.GoalVisibility.PRIVATE) {
                // Skip private users from the public leaderboard completely to protect privacy
                continue;
            } else if (u.getGoalVisibility() == com.team7.carbontrack.entity.GoalVisibility.LEADERBOARD) {
                // Show masked username
                if (displayName.length() > 3) {
                    displayName = displayName.substring(0, 2) + "***" + displayName.substring(displayName.length() - 1);
                } else {
                    displayName = displayName.charAt(0) + "***";
                }
            }

            double totalEmissions = emissionMap.getOrDefault(u.getId(), 0.0);
            BigDecimal avgDaily = BigDecimal.valueOf(totalEmissions / 30.0)
                    .setScale(2, RoundingMode.HALF_UP);

            // Fetch user badges
            List<String> badgeNames = badgeService.getUserBadges(u.getId()).stream()
                    .map(Badge::getName)
                    .collect(Collectors.toList());

            // Category Strength & Habits
            List<ActivityLog> userLogs = activityLogRepository.findByUserIdAndLogDateBetween(u.getId(), thirtyDaysAgo, LocalDate.now());
            String categoryStrength = getCategoryStrength(userLogs);
            List<String> habits = getHabitTips(userLogs);

            entries.add(new LeaderboardEntry(
                    u.getId(),
                    displayName,
                    avgDaily,
                    badgeNames,
                    categoryStrength,
                    habits,
                    u.getSelectedBadge()
            ));
        }

        // Sort ascending by emissions (lowest footprint first)
        entries.sort(Comparator.comparing(LeaderboardEntry::averageDailyEmission));

        // Return top 50
        List<LeaderboardEntry> top50 = entries.stream().limit(50).collect(Collectors.toList());
        return ResponseEntity.ok(top50);
    }

    private String getCategoryStrength(List<ActivityLog> logs) {
        if (logs.isEmpty()) {
            return "No activities logged yet";
        }
        Map<ActivityCategory, Double> sums = logs.stream()
                .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(al -> al.getCo2eKg().doubleValue())));

        ActivityCategory bestCategory = ActivityCategory.TRANSPORT;
        double minVal = Double.MAX_VALUE;
        for (ActivityCategory cat : ActivityCategory.values()) {
            double sum = sums.getOrDefault(cat, 0.0);
            if (sum < minVal) {
                minVal = sum;
                bestCategory = cat;
            }
        }

        switch (bestCategory) {
            case TRANSPORT: return "Minimal transportation footprint";
            case ELECTRICITY: return "Highly efficient home energy usage";
            case FOOD: return "Low-carbon dietary footprint";
            case SHOPPING: return "Conscious and minimal consumer spending";
            default: return "Balanced carbon distribution";
        }
    }

    private List<String> getHabitTips(List<ActivityLog> logs) {
        List<String> habits = new ArrayList<>();
        boolean hasVegan = logs.stream().anyMatch(al -> al.getActivityType().equals("VEGAN_MEAL"));
        boolean hasElectric = logs.stream().anyMatch(al -> al.getActivityType().equals("CAR_ELECTRIC"));
        boolean hasRenewable = logs.stream().anyMatch(al -> al.getActivityType().equals("RENEWABLE_ELECTRICITY"));

        if (hasVegan) habits.add("Prioritizes 100% plant-based vegan meals");
        if (hasElectric) habits.add("Uses electric vehicles for transportation");
        if (hasRenewable) habits.add("Powers household with renewable electricity");

        if (habits.isEmpty()) {
            habits.add("Frequently uses public transit");
            habits.add("Practices sustainable general shopping");
        }
        return habits;
    }
}
