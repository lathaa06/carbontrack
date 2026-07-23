package com.team7.carbontrack.dto;

import java.math.BigDecimal;

/** A transparent, data-driven recommendation generated from a user's recent activity. */
public record RecommendationInsight(
        String activityType,
        String title,
        String action,
        String rationale,
        BigDecimal recentCo2e,
        BigDecimal potentialMonthlySaving
) {}
