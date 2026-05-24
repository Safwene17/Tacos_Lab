package com.example.backend.entity;

import com.example.backend.constant.AppConstants;
import com.example.backend.enums.EmployeeStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(
        name = "employees",
        indexes = {
                @Index(name = "idx_employees_status", columnList = "employmentStatus"),
                @Index(name = "idx_employees_last_name", columnList = "lastName")
        }
)
public class Employee extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String firstName;

    @Column(nullable = false, length = 120)
    private String lastName;

    @Column(nullable = false, length = 40)
    private String phoneNumber;

    @Column
    private String email;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salaryAmount;

    @Column(nullable = false, length = 3)
    private String salaryCurrency = AppConstants.CURRENCY_RON;

    @Column(length = 120)
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmployeeStatus employmentStatus = EmployeeStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDate firstWorkingDay;

    @Column(length = 180)
    private String emergencyContactName;

    @Column(length = 40)
    private String emergencyContactPhone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public String fullName() {
        return firstName + " " + lastName;
    }
}