package com.example.backend.dto.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record AdminMediaAssetResponse(
        UUID id,
        String publicId,
        String secureUrl,
        String resourceType,
        String format,
        Integer width,
        Integer height,
        Long bytes,
        String version,
        String folder,
        String altEn,
        String altRo,
        boolean primary,
        Integer displayOrder
) {
}