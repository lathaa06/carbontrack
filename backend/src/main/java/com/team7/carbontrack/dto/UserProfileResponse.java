package com.team7.carbontrack.dto;

import com.team7.carbontrack.entity.GoalVisibility;
import com.team7.carbontrack.entity.AuthProvider;
import com.team7.carbontrack.entity.Role;
import com.team7.carbontrack.entity.UnitSystem;
import com.team7.carbontrack.entity.User;

import java.time.Instant;

public record UserProfileResponse(
        Long id,
        String username,
        String email,
        Role role,
        AuthProvider authProvider,
        Long orgId,
        UnitSystem preferredUnitSystem,
        GoalVisibility goalVisibility,
        String profilePhoto,
        Instant createdAt,
        String selectedBadge,
        java.util.List<String> badges
) {
    public static UserProfileResponse from(User user) {
        return from(user, java.util.List.of());
    }

    public static UserProfileResponse from(User user, java.util.List<String> badges) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getAuthProvider(),
                user.getOrgId(),
                user.getPreferredUnitSystem(),
                user.getGoalVisibility(),
                user.getProfilePhoto(),
                user.getCreatedAt(),
                user.getSelectedBadge(),
                badges
        );
    }
}
