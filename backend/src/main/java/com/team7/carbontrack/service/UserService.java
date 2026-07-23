package com.team7.carbontrack.service;

import com.team7.carbontrack.dto.UpdateProfileRequest;
import com.team7.carbontrack.dto.UserProfileResponse;
import com.team7.carbontrack.entity.User;
import com.team7.carbontrack.exception.ResourceNotFoundException;
import com.team7.carbontrack.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BadgeService badgeService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BadgeService badgeService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.badgeService = badgeService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = findUserOrThrow(userId);
        List<String> badgeNames = badgeService.getUserBadges(userId).stream()
                .map(com.team7.carbontrack.entity.Badge::getName)
                .collect(java.util.stream.Collectors.toList());
        return UserProfileResponse.from(user, badgeNames);
    }

    @Transactional
    @CacheEvict(value = "analytics", key = "#userId")
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserOrThrow(userId);

        // Update username if requested and different
        if (request.username() != null && !request.username().isBlank()) {
            String newUsername = request.username().trim();
            if (!newUsername.equalsIgnoreCase(user.getUsername())) {
                if (userRepository.existsByUsernameIgnoreCase(newUsername)) {
                    throw new com.team7.carbontrack.exception.DuplicateResourceException("Username is already taken: " + newUsername);
                }
                user.setUsername(newUsername);
            }
        }

        if (request.preferredUnitSystem() != null) {
            user.setPreferredUnitSystem(request.preferredUnitSystem());
        }
        if (request.goalVisibility() != null) {
            user.setGoalVisibility(request.goalVisibility());
        }
        if (request.profilePhoto() != null) {
            user.setProfilePhoto(request.profilePhoto().trim().isEmpty() ? null : request.profilePhoto());
        }
        if (request.selectedBadge() != null) {
            List<String> userBadges = badgeService.getUserBadges(userId).stream()
                    .map(com.team7.carbontrack.entity.Badge::getName)
                    .collect(java.util.stream.Collectors.toList());
            if (request.selectedBadge().isEmpty() || userBadges.contains(request.selectedBadge())) {
                user.setSelectedBadge(request.selectedBadge().isEmpty() ? null : request.selectedBadge());
            } else {
                throw new IllegalArgumentException("You have not earned the badge: " + request.selectedBadge());
            }
        }

        User saved = userRepository.save(user);
        List<String> badgeNames = badgeService.getUserBadges(userId).stream()
                .map(com.team7.carbontrack.entity.Badge::getName)
                .collect(java.util.stream.Collectors.toList());
        return UserProfileResponse.from(saved, badgeNames);
    }

    /** Lets a verified Google user add a password for normal username/email sign-in on any device. */
    @Transactional
    public void setPassword(Long userId, String rawPassword) {
        User user = findUserOrThrow(userId);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}
