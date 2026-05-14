package com.example.backend.dto.response;

import com.example.backend.enums.TransactionType;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record CategoryBreakdownResponse(
        UUID categoryId,
        String categoryName,
        TransactionType type,
        BigDecimal total
) {
}