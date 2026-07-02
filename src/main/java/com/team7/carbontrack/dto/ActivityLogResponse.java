package com.team7.carbontrack.dto;

import com.team7.carbontrack.entity.ActivityCategory;
import com.team7.carbontrack.entity.ActivityLog;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ActivityLogResponse(
        Long id,
        ActivityCategory category,
        String activityType,
        BigDecimal quantity,
        String unit,
        BigDecimal co2eKg,
        LocalDate logDate,
        String notes
) {
    public static ActivityLogResponse from(ActivityLog log) {
        return new ActivityLogResponse(
                log.getId(),
                log.getCategory(),
                log.getActivityType(),
                log.getQuantity(),
                log.getUnit(),
                log.getCo2eKg(),
                log.getLogDate(),
                log.getNotes()
        );
    }
}
