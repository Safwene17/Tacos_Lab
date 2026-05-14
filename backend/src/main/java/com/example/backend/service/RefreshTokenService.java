package com.example.backend.service;

import com.example.backend.config.AppProperties;
import com.example.backend.entity.AdminUser;
import com.example.backend.entity.RefreshToken;
import com.example.backend.exception.BusinessException;
import com.example.backend.repository.RefreshTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final AppProperties appProperties;

    @Transactional
    public IssuedRefreshToken issue(AdminUser adminUser, HttpServletRequest request) {
        String rawToken = generateRawToken();
        String tokenHash = hash(rawToken);
        Instant expiresAt = Instant.now().plusSeconds(refreshTokenExpiresInSeconds());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setAdminUser(adminUser);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setExpiresAt(expiresAt);
        refreshToken.setCreatedByIp(clientIp(request));
        refreshToken.setUserAgent(request.getHeader("User-Agent"));

        refreshTokenRepository.save(refreshToken);

        return new IssuedRefreshToken(rawToken, expiresAt);
    }

    @Transactional
    public RotatedRefreshToken rotate(String rawToken, HttpServletRequest request) {
        RefreshToken existingToken = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BusinessException("Invalid refresh token."));

        if (!existingToken.isActive()) {
            throw new BusinessException("Refresh token is expired or revoked.");
        }

        existingToken.setRevokedAt(Instant.now());

        IssuedRefreshToken newRefreshToken = issue(existingToken.getAdminUser(), request);

        return new RotatedRefreshToken(existingToken.getAdminUser(), newRefreshToken.rawToken(), newRefreshToken.expiresAt());
    }

    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .filter(RefreshToken::isActive)
                .ifPresent(token -> token.setRevokedAt(Instant.now()));
    }

    @Transactional
    public void revokeAll(AdminUser adminUser) {
        refreshTokenRepository.findAllByAdminUserAndRevokedAtIsNull(adminUser)
                .forEach(token -> token.setRevokedAt(Instant.now()));
    }

    public long refreshTokenExpiresInSeconds() {
        return appProperties.security().jwt().refreshTokenDays() * 24 * 60 * 60;
    }

    private String generateRawToken() {
        byte[] bytes = new byte[64];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to hash refresh token.", exception);
        }
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    public record IssuedRefreshToken(String rawToken, Instant expiresAt) {
    }

    public record RotatedRefreshToken(AdminUser adminUser, String rawToken, Instant expiresAt) {
    }
}