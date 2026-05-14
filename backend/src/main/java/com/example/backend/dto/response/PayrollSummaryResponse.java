package com.example.backend.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record PayrollSummaryResponse(
        LocalDate from,
        LocalDate to,
        BigDecimal totalPayroll,
        long payrollTransactionsCount
) {
}