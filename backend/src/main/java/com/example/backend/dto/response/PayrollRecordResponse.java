package com.example.backend.dto.response;

import com.example.backend.enums.PaymentMethod;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record PayrollRecordResponse(
        UUID id,
        UUID employeeId,
        String employeeName,
        BigDecimal amount,
        String currency,
        LocalDate paymentDate,
        LocalDate periodStart,
        LocalDate periodEnd,
        PaymentMethod paymentMethod,
        String notes,
        UUID transactionId
) {
}