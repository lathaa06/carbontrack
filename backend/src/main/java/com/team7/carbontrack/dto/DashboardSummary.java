package com.team7.carbontrack.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardSummary(
        BigDecimal todayCo2e,
        BigDecimal weeklyCo2e,
        BigDecimal monthlyCo2e,

        // 🔥 Streak Information
        Integer currentStreak,
        Integer longestStreak,

        List<CategoryEmission> categoryBreakdown,
        List<DailyEmission> thisWeekTrend,
        List<DailyEmission> lastWeekTrend,
        List<ActivityLogResponse> recentActivities,
        List<String> recommendations,
        List<RecommendationInsight> recommendationInsights,
        Double percentileRank,
        Map<String, BigDecimal> categoryAverages,
        ActiveGoalProgress activeGoal
) {

    public record ActiveGoalProgress(
            Long id,
            BigDecimal targetReductionPct,
            Integer periodDays,
            java.time.LocalDate startDate,
            BigDecimal baselineCo2e,
            BigDecimal targetCo2e,
            BigDecimal currentCo2e,
            BigDecimal progressPct,
            String trajectoryStatus,
            String alertMessage
    ) {}
}
