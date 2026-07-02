package com.team7.carbontrack.dto;

import com.team7.carbontrack.entity.ActivityCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Single request shape shared by all four activity categories (transport,
 * electricity, food, shopping). The activityType/unit combination is what
 * distinguishes them and is what the emission calculation engine looks up.
 */
public record ActivityLogRequest(

        @NotNull(message = "Category is required")
        ActivityCategory category,

        @NotBlank(message = "Activity type is required")
        @Size(max = 60, message = "Activity type must be at most 60 characters")
        String activityType,

        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.0", message = "Quantity must be zero or greater")
        @DecimalMax(value = "1000000", message = "Quantity exceeds the maximum allowed value")
        @Digits(integer = 8, fraction = 4, message = "Quantity has too many digits")
        BigDecimal quantity,

        @NotBlank(message = "Unit is required")
        @Size(max = 20, message = "Unit must be at most 20 characters")
        String unit,

        @NotNull(message = "Log date is required")
        @PastOrPresent(message = "Log date cannot be in the future")
        LocalDate logDate,

        @Size(max = 500, message = "Notes must be at most 500 characters")
        String notes
) {}
