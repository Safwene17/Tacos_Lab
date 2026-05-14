package com.example.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Security security,
        Cors cors,
        Admin admin,
        Cloudinary cloudinary
) {

    public record Security(
            Jwt jwt,
            RefreshCookie refreshCookie
    ) {
    }

    public record Jwt(
            String secret,
            long accessTokenMinutes,
            long refreshTokenDays,
            String issuer
    ) {
    }

    public record RefreshCookie(
            String name,
            String path,
            boolean httpOnly,
            boolean secure,
            String sameSite
    ) {
    }

    public record Cors(
            List<String> allowedOrigins,
            List<String> allowedMethods,
            List<String> allowedHeaders,
            boolean allowCredentials
    ) {
    }

    public record Admin(
            String email,
            String initialPassword
    ) {
    }

    public record Cloudinary(
            String cloudName,
            String apiKey,
            String apiSecret,
            String folder
    ) {
    }
}