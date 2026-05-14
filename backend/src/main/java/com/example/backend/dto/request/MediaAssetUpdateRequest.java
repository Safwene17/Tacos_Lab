package com.example.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MediaAssetUpdateRequest(

        @Size(max = 255, message = "English alt text must not exceed 255 characters.")
        String altEn,

        @Size(max = 255, message = "Romanian alt text must not exceed 255 characters.")
        String altRo,

        boolean primary,

        @NotNull(message = "Display order is required.")
        @Min(value = 0, message = "Display order cannot be negative.")
        Integer displayOrder
) {
}