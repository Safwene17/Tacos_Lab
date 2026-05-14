package com.example.backend.dto.response;

import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.TransactionType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record TransactionResponse(
        UUID id,
        TransactionType type,
        BigDecimal amount,
        String currency,
        LocalDate transactionDate,
        UUID categoryId,
        String categoryName,
        PaymentMethod paymentMethod,
        String notes,
        UUID employeeId,
        String employeeName,
        UUID menuItemId,
        String menuItemNameEn,
        UUID payrollRecordId
) {
}