package com.team7.carbontrack.dto;

import java.math.BigDecimal;
import java.util.List;

public record LeaderboardEntry(
    Long userId,
    String username,
    BigDecimal averageDailyEmission,
    List<String> badges,
    String categoryStrength,
    List<String> habitTips,
    String selectedBadge
) {}
