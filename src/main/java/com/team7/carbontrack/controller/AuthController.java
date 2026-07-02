package com.team7.carbontrack.controller;

import com.team7.carbontrack.dto.AuthResponse;
import com.team7.carbontrack.dto.LoginRequest;
import com.team7.carbontrack.dto.RegisterRequest;
import com.team7.carbontrack.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * These two endpoints are the only ones open to the public (see SecurityConfig's
 * PUBLIC_ENDPOINTS list) -- everything else requires a valid JWT in the
 * Authorization header, e.g.  Authorization: Bearer <accessToken>
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
