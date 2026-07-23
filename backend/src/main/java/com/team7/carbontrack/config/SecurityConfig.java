package com.team7.carbontrack.config;

import com.team7.carbontrack.security.JwtAuthenticationFilter;
import com.team7.carbontrack.security.OAuth2LoginSuccessHandler;
import com.team7.carbontrack.security.OAuth2LoginFailureHandler;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * GOOGLE OAUTH2 IS TRULY OPTIONAL: Google login is only wired up when real
 * GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET env vars are set (see application.yml).
 * When they're absent, Spring Boot never creates a ClientRegistrationRepository
 * bean, ObjectProvider below resolves to null, and .oauth2Login(...) is simply
 * skipped -- the app still starts fine with JWT-only auth. Nothing else needs
 * to change either way; every controller is already auth-method agnostic.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_ENDPOINTS = {
            "/",
            "/index.html",
            "/assets/**",
            "/api/v1/auth/**",
            "/oauth2/**",
            "/login/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/actuator/health"
    };

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider;
    private final ObjectProvider<OAuth2LoginSuccessHandler> oAuth2LoginSuccessHandlerProvider;
    private final ObjectProvider<OAuth2LoginFailureHandler> oAuth2LoginFailureHandlerProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserDetailsService userDetailsService,
                          ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider,
                          ObjectProvider<OAuth2LoginSuccessHandler> oAuth2LoginSuccessHandlerProvider,
                          ObjectProvider<OAuth2LoginFailureHandler> oAuth2LoginFailureHandlerProvider) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
        this.clientRegistrationRepositoryProvider = clientRegistrationRepositoryProvider;
        this.oAuth2LoginSuccessHandlerProvider = oAuth2LoginSuccessHandlerProvider;
        this.oAuth2LoginFailureHandlerProvider = oAuth2LoginFailureHandlerProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // stateless JWT API; CSRF protection is not applicable
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider());

        // Only enable Google login if a real client registration exists (i.e. env
        // vars were actually set). Keeps JWT-only startup working when they aren't.
        ClientRegistrationRepository clientRegistrationRepository = clientRegistrationRepositoryProvider.getIfAvailable();
        boolean isGoogleConfigured = false;
        if (clientRegistrationRepository != null) {
            ClientRegistration googleReg = clientRegistrationRepository.findByRegistrationId("google");
            if (googleReg != null && !"dummy-id".equals(googleReg.getClientId()) && !googleReg.getClientId().isBlank()) {
                isGoogleConfigured = true;
            }
        }

        if (isGoogleConfigured) {
            OAuth2LoginSuccessHandler successHandler = oAuth2LoginSuccessHandlerProvider.getObject();
            OAuth2LoginFailureHandler failureHandler = oAuth2LoginFailureHandlerProvider.getObject();
            http.oauth2Login(oauth2 -> oauth2.successHandler(successHandler).failureHandler(failureHandler));
        }

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Tighten this to the deployed frontend origin(s) outside local dev.
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

