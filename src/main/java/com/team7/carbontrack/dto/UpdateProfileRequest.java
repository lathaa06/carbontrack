package com.team7.carbontrack.dto;

import com.team7.carbontrack.entity.GoalVisibility;
import com.team7.carbontrack.entity.UnitSystem;

/**
 * Both fields are optional (partial update). Null means "leave unchanged".
 */
public record UpdateProfileRequest(
        UnitSystem preferredUnitSystem,
        GoalVisibility goalVisibility
) {}
