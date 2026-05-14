package com.example.backend.dto.request;

import com.example.backend.enums.EmployeeStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeRequest(

        @NotBlank(message = "First name is required.")
        @Size(max = 120, message = "First name must not exceed 120 characters.")
        String firstName,

        @NotBlank(message = "Last name is required.")
        @Size(max = 120, message = "Last name must not exceed 120 characters.")
        String lastName,

        @NotBlank(message = "Phone number is required.")
        @Size(max = 40, message = "Phone number must not exceed 40 characters.")
        String phoneNumber,

        @Email(message = "Email must be valid.")
        String email,

        @NotNull(message = "Salary amount is required.")
        @DecimalMin(value = "0.01", message = "Salary amount must be greater than zero.")
        BigDecimal salaryAmount,

        @Size(max = 120, message = "Role must not exceed 120 characters.")
        String role,

        @NotNull(message = "Employment status is required.")
        EmployeeStatus employmentStatus,

        @NotNull(message = "First working day is required.")
        @PastOrPresent(message = "First working day cannot be in the future.")
        LocalDate firstWorkingDay,

        @Size(max = 180, message = "Emergency contact name must not exceed 180 characters.")
        String emergencyContactName,

        @Size(max = 40, message = "Emergency contact phone must not exceed 40 characters.")
        String emergencyContactPhone,

        String notes
) {
}