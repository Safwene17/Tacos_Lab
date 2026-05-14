package com.example.backend.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Builder
public record PublicMenuItemResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        String currency,
        String weightLabel,
        boolean markAsNew,
        boolean popular,
        UUID categoryId,
        String categoryName,
        List<PublicMediaAssetResponse> images
) {
}