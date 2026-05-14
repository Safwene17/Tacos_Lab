package com.example.backend.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record AuthResponse(
        String accessToken,
        long expiresInSeconds,
        Instant expiresAt,
        boolean mustChangePassword
) {
}