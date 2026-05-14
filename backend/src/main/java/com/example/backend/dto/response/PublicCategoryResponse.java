package com.example.backend.dto.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record PublicCategoryResponse(
        UUID id,
        String name,
        boolean markAsNew,
        Integer displayOrder
) {
}