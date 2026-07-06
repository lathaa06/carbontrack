package com.team7.carbontrack.security;

import com.team7.carbontrack.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * Issues and validates JWT access/refresh tokens. Kept provider-agnostic:
 * both local password login and Google OAuth2 login end here to mint the
 * same kind of token, so downstream API consumers never need to know how
 * the user authenticated.
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final JwtProperties jwtProperties;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        byte[] keyBytes = Base64.getDecoder().decode(jwtProperties.secret());
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(UserDetails userDetails, Long userId) {
        String subject = userDetails.getUsername();
        if (userDetails instanceof UserPrincipal) {
            subject = ((UserPrincipal) userDetails).getUser().getEmail();
        }
        return buildToken(subject, Map.of("uid", userId, "type", "access"),
                jwtProperties.accessTokenExpirationMs());
    }

    public String generateRefreshToken(UserDetails userDetails, Long userId) {
        String subject = userDetails.getUsername();
        if (userDetails instanceof UserPrincipal) {
            subject = ((UserPrincipal) userDetails).getUser().getEmail();
        }
        return buildToken(subject, Map.of("uid", userId, "type", "refresh"),
                jwtProperties.refreshTokenExpirationMs());
    }

    private String buildToken(String subject, Map<String, Object> claims, long expirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuer(jwtProperties.issuer())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        Number uid = claims.get("uid", Number.class);
        return uid == null ? null : uid.longValue();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String subject = extractUsername(token);
            String expected = userDetails.getUsername();
            if (userDetails instanceof UserPrincipal) {
                expected = ((UserPrincipal) userDetails).getUser().getEmail();
            }
            return subject.equals(expected) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
