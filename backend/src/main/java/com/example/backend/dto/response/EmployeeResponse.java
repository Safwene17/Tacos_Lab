package com.example.backend.dto.response;

import com.example.backend.enums.EmployeeStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record EmployeeResponse(
        UUID id,
        String firstName,
        String lastName,
        String fullName,
        String phoneNumber,
        String email,
        BigDecimal salaryAmount,
        String salaryCurrency,
        String role,
        EmployeeStatus employmentStatus,
        LocalDate firstWorkingDay,
        String emergencyContactName,
        String emergencyContactPhone,
        String notes,
        LocalDate lastPaymentDate,
        long payrollRecordsCount,
        long monthsEmployed
) {
}