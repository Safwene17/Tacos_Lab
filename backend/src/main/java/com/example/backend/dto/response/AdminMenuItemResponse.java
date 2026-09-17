package com.example.backend.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Builder
public record AdminMenuItemResponse(
        UUID id,
        UUID categoryId,
        String categoryName,
        String name,
        String description,
        java.util.List<String> ingredients,
        BigDecimal price,
        String currency,
        String weightLabel,
        boolean markAsNew,
        boolean popular,
        boolean active,
        Integer displayOrder,
        List<AdminMediaAssetResponse> images
) {
}