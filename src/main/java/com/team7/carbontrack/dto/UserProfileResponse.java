package com.team7.carbontrack.dto;

import com.team7.carbontrack.entity.GoalVisibility;
import com.team7.carbontrack.entity.Role;
import com.team7.carbontrack.entity.UnitSystem;
import com.team7.carbontrack.entity.User;

import java.time.Instant;

public record UserProfileResponse(
        Long id,
        String username,
        String email,
        Role role,
        Long orgId,
        UnitSystem preferredUnitSystem,
        GoalVisibility goalVisibility,
        Instant createdAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getOrgId(),
                user.getPreferredUnitSystem(),
                user.getGoalVisibility(),
                user.getCreatedAt()
        );
    }
}
