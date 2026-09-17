package com.example.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "Name is required.")
        @Size(max = 150, message = "Name must not exceed 150 characters.")
        String name,

        boolean markAsNew,

        boolean active,

        @NotNull(message = "Display order is required.")
        @Min(value = 0, message = "Display order cannot be negative.")
        Integer displayOrder
) {
}