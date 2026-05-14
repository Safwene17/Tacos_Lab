package com.example.backend.dto.request;

import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionRequest(

        @NotNull(message = "Transaction type is required.")
        TransactionType type,

        @NotNull(message = "Amount is required.")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero.")
        BigDecimal amount,

        @NotNull(message = "Transaction date is required.")
        @PastOrPresent(message = "Transaction date cannot be in the future.")
        LocalDate transactionDate,

        @NotNull(message = "Category id is required.")
        UUID categoryId,

        @NotNull(message = "Payment method is required.")
        PaymentMethod paymentMethod,

        String notes,

        UUID employeeId,

        UUID menuItemId
) {
}