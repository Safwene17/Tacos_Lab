package com.example.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MediaAssetOrderRequest(

        @NotNull(message = "Image id is required.")
        UUID imageId,

        @Min(value = 0, message = "Display order cannot be negative.")
        int displayOrder
) {
}