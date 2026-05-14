package com.example.backend.dto.request;

import com.example.backend.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PayrollRecordRequest(

        @NotNull(message = "Amount is required.")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero.")
        BigDecimal amount,

        @NotNull(message = "Payment date is required.")
        @PastOrPresent(message = "Payment date cannot be in the future.")
        LocalDate paymentDate,

        LocalDate periodStart,

        LocalDate periodEnd,

        PaymentMethod paymentMethod,

        String notes
) {
}