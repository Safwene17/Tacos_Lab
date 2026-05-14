package com.example.backend.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Builder
public record AdminMenuItemResponse(
        UUID id,
        UUID categoryId,
        String categoryNameEn,
        String nameEn,
        String nameRo,
        String descriptionEn,
        String descriptionRo,
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