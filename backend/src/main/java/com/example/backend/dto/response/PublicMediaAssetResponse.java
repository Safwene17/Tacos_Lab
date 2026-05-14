package com.example.backend.dto.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record PublicMediaAssetResponse(
        UUID id,
        String url,
        String alt,
        boolean primary,
        Integer displayOrder
) {
}