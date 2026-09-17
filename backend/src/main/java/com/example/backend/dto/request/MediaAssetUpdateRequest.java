package com.example.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MediaAssetUpdateRequest(

        @Size(max = 255, message = "Alt text must not exceed 255 characters.")
        String alt,

        boolean primary,

        @NotNull(message = "Display order is required.")
        @Min(value = 0, message = "Display order cannot be negative.")
        Integer displayOrder
) {
}