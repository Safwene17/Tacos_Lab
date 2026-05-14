package com.example.backend.dto.response;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record PeriodFinancialStatResponse(
        String period,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal netProfit
) {
}