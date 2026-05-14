package com.example.backend.dto.request;

import com.example.backend.enums.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TransactionCategoryRequest(

        @NotNull(message = "Transaction category type is required.")
        TransactionType type,

        @NotBlank(message = "Category name is required.")
        @Size(max = 150, message = "Category name must not exceed 150 characters.")
        String name,

        @Size(max = 80, message = "System key must not exceed 80 characters.")
        String systemKey,

        boolean active,

        @NotNull(message = "Display order is required.")
        @Min(value = 0, message = "Display order cannot be negative.")
        Integer displayOrder
) {
}