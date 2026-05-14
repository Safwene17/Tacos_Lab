package com.example.backend.dto.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record AdminCategoryResponse(
        UUID id,
        String nameEn,
        String nameRo,
        boolean markAsNew,
        boolean active,
        Integer displayOrder
) {
}