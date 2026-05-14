package com.example.backend.dto.response;

import com.example.backend.enums.TransactionType;
import lombok.Builder;

import java.util.UUID;

@Builder
public record TransactionCategoryResponse(
        UUID id,
        TransactionType type,
        String name,
        String systemKey,
        boolean active,
        Integer displayOrder
) {
}