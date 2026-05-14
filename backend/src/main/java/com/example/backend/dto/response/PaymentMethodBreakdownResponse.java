package com.example.backend.dto.response;

import com.example.backend.enums.PaymentMethod;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record PaymentMethodBreakdownResponse(
        PaymentMethod paymentMethod,
        BigDecimal total
) {
}