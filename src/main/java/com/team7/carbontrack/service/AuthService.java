package com.team7.carbontrack.service;

import com.team7.carbontrack.dto.AuthResponse;
import com.team7.carbontrack.dto.LoginRequest;
import com.team7.carbontrack.dto.RegisterRequest;
import com.team7.carbontrack.dto.UserProfileResponse;
import com.team7.carbontrack.config.JwtProperties;
import com.team7.carbontrack.entity.AuthProvider;
import com.team7.carbontrack.entity.User;
import com.team7.carbontrack.exception.DuplicateResourceException;
import com.team7.carbontrack.exception.InvalidCredentialsException;
import com.team7.carbontrack.repository.UserRepository;
import com.team7.carbontrack.security.JwtService;
import com.team7.carbontrack.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtService jwtService, JwtProperties jwtProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Fail fast with a clear message rather than letting the DB's unique
        // constraint throw a raw SQL exception up to the client.
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username is already taken: " + request.username());
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password())) // never store plain text
                .authProvider(AuthProvider.LOCAL)
                .build();

        User saved = userRepository.save(user);
        return issueTokens(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmailIgnoreCase(request.usernameOrEmail()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username/email or password"));

        if (user.getPasswordHash() == null) {
            // This account was created via Google OAuth2 and has no local password to check.
            throw new InvalidCredentialsException("This account uses Google sign-in. Please log in with Google.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid username/email or password");
        }

        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal, user.getId());
        String refreshToken = jwtService.generateRefreshToken(principal, user.getId());
        return AuthResponse.of(accessToken, refreshToken, jwtProperties.accessTokenExpirationMs(),
                UserProfileResponse.from(user));
    }
}
