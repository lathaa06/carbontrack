package com.team7.carbontrack.dto;

import com.team7.carbontrack.entity.GoalVisibility;
import com.team7.carbontrack.entity.UnitSystem;

/**
 * All fields are optional (partial update). Null means "leave unchanged".
 */
public record UpdateProfileRequest(
        String username,
        UnitSystem preferredUnitSystem,
        GoalVisibility goalVisibility,
        String profilePhoto,
        String selectedBadge
) {}
