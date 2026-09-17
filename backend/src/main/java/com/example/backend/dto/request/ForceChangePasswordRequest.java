package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForceChangePasswordRequest(

        @NotBlank(message = "New password is required.")
        @Size(min = 8, message = "New password must contain at least 8 characters.")
        String newPassword
) {
}
