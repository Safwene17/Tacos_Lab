package com.example.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record MenuItemRequest(

        @NotNull(message = "Category id is required.")
        UUID categoryId,

        @NotBlank(message = "English name is required.")
        @Size(max = 180, message = "English name must not exceed 180 characters.")
        String nameEn,

        @NotBlank(message = "Romanian name is required.")
        @Size(max = 180, message = "Romanian name must not exceed 180 characters.")
        String nameRo,

        String descriptionEn,

        String descriptionRo,

        @NotNull(message = "Price is required.")
        @DecimalMin(value = "0.01", message = "Price must be greater than zero.")
        BigDecimal price,

        @Size(max = 50, message = "Weight label must not exceed 50 characters.")
        String weightLabel,

        boolean markAsNew,

        boolean popular,

        boolean active,

        @NotNull(message = "Display order is required.")
        @Min(value = 0, message = "Display order cannot be negative.")
        Integer displayOrder
) {
}