package com.team7.carbontrack.security;

import com.team7.carbontrack.entity.AuthProvider;
import com.team7.carbontrack.entity.User;
import com.team7.carbontrack.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * Handles a successful Google login: looks up or provisions the matching
 * local User, then mints the same access/refresh JWT pair a password login
 * would produce -- every other endpoint in the app stays auth-method agnostic.
 * Only reached at all if Google credentials are configured (see SecurityConfig).
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    public OAuth2LoginSuccessHandler(UserRepository userRepository, JwtService jwtService, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String googleSub = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        User user = userRepository.findByProviderIdAndAuthProvider(googleSub, AuthProvider.GOOGLE)
                .or(() -> userRepository.findByEmailIgnoreCase(email))
                .orElseGet(() -> provisionUser(googleSub, email, name));

        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal, user.getId());
        String refreshToken = jwtService.generateRefreshToken(principal, user.getId());

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "tokenType", "Bearer"
        ));
    }

    private User provisionUser(String googleSub, String email, String name) {
        String baseUsername = (name != null ? name : email).replaceAll("[^a-zA-Z0-9_.-]", "").toLowerCase();
        String username = baseUsername.isBlank() ? "user" + googleSub.hashCode() : baseUsername;
        String candidate = username;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = username + suffix++;
        }

        User user = User.builder()
                .username(candidate)
                .email(email)
                .authProvider(AuthProvider.GOOGLE)
                .providerId(googleSub)
                .build();
        return userRepository.save(user);
    }
}
