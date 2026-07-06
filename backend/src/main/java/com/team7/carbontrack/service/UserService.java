package com.team7.carbontrack.service;

import com.team7.carbontrack.dto.UpdateProfileRequest;
import com.team7.carbontrack.dto.UserProfileResponse;
import com.team7.carbontrack.entity.User;
import com.team7.carbontrack.exception.ResourceNotFoundException;
import com.team7.carbontrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = findUserOrThrow(userId);
        return UserProfileResponse.from(user);
    }

    @Transactional
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
            user.setProfilePhoto(request.profilePhoto());
        }

        User saved = userRepository.save(user);
        return UserProfileResponse.from(saved);
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}
