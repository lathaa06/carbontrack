package com.team7.carbontrack.controller;

import com.team7.carbontrack.dto.UpdateProfileRequest;
import com.team7.carbontrack.dto.SetPasswordRequest;
import com.team7.carbontrack.dto.UserProfileResponse;
import com.team7.carbontrack.security.UserPrincipal;
import com.team7.carbontrack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getId()));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(principal.getId(), request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> setMyPassword(@AuthenticationPrincipal UserPrincipal principal,
                                               @Valid @RequestBody SetPasswordRequest request) {
        userService.setPassword(principal.getId(), request.password());
        return ResponseEntity.noContent().build();
    }
}
