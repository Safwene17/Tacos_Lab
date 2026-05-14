package com.example.backend.service;

import com.example.backend.config.AppProperties;
import com.example.backend.entity.AdminUser;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.exception.TokenExpiredException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final AppProperties appProperties;
    private final SecretKey signingKey;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;

        String secret = appProperties.security().jwt().secret();

        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes.");
        }

        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // ------------------------------------------------------------------ //
    //  Generation
    // ------------------------------------------------------------------ //

    public String generateAccessToken(AdminUser adminUser) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(accessTokenExpiresInSeconds());

        return Jwts.builder()
                .subject(adminUser.getEmail())
                .issuer(appProperties.security().jwt().issuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    // ------------------------------------------------------------------ //
    //  Extraction
    // ------------------------------------------------------------------ //

    public String extractSubject(String token) {
        return claims(token).getSubject();
    }

    public Instant extractExpiration(String token) {
        return claims(token).getExpiration().toInstant();
    }

    // ------------------------------------------------------------------ //
    //  Validation
    // ------------------------------------------------------------------ //

    public boolean isValid(String token, String expectedEmail) {
        try {
            Claims c = claims(token);
            String emailInToken = c.getSubject();
            boolean notExpired = !c.getExpiration().before(new Date());
            return expectedEmail.equalsIgnoreCase(emailInToken) && notExpired;
        } catch (TokenExpiredException | InvalidTokenException e) {
            return false;
        }
    }

    // ------------------------------------------------------------------ //
    //  Helpers
    // ------------------------------------------------------------------ //

    public long accessTokenExpiresInSeconds() {
        return appProperties.security().jwt().accessTokenMinutes() * 60L;
    }

    private Claims claims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(appProperties.security().jwt().issuer())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new TokenExpiredException("Access token has expired");
        } catch (JwtException e) {
            throw new InvalidTokenException("Access token is invalid or tampered");
        }
    }
}