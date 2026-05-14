package com.example.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "English name is required.")
        @Size(max = 150, message = "English name must not exceed 150 characters.")
        String nameEn,

        @NotBlank(message = "Romanian name is required.")
        @Size(max = 150, message = "Romanian name must not exceed 150 characters.")
        String nameRo,

        boolean markAsNew,

        boolean active,

        @NotNull(message = "Display order is required.")
        @Min(value = 0, message = "Display order cannot be negative.")
        Integer displayOrder
) {
}