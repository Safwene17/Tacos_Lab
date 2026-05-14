package com.example.backend.dto.response;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record AdminMeResponse(
        UUID id,
        String email,
        String role,
        boolean mustChangePassword
) {
}