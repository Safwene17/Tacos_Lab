package com.example.backend.mapper;

import com.example.backend.dto.response.EmployeeResponse;
import com.example.backend.dto.response.PayrollRecordResponse;
import com.example.backend.entity.Employee;
import com.example.backend.entity.PayrollRecord;
import com.example.backend.entity.Transaction;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;

@Component
public class EmployeeMapper {

    public EmployeeResponse toEmployeeResponse(
            Employee employee,
            LocalDate lastPaymentDate,
            long payrollRecordsCount
    ) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(employee.fullName())
                .phoneNumber(employee.getPhoneNumber())
                .email(employee.getEmail())
                .salaryAmount(employee.getSalaryAmount())
                .salaryCurrency(employee.getSalaryCurrency())
                .role(employee.getRole())
                .employmentStatus(employee.getEmploymentStatus())
                .firstWorkingDay(employee.getFirstWorkingDay())
                .emergencyContactName(employee.getEmergencyContactName())
                .emergencyContactPhone(employee.getEmergencyContactPhone())
                .notes(employee.getNotes())
                .lastPaymentDate(lastPaymentDate)
                .payrollRecordsCount(payrollRecordsCount)
                .monthsEmployed(monthsEmployed(employee))
                .build();
    }

    public PayrollRecordResponse toPayrollRecordResponse(
            PayrollRecord payrollRecord,
            Transaction transaction
    ) {
        return PayrollRecordResponse.builder()
                .id(payrollRecord.getId())
                .employeeId(payrollRecord.getEmployee().getId())
                .employeeName(payrollRecord.getEmployee().fullName())
                .amount(payrollRecord.getAmount())
                .currency(payrollRecord.getCurrency())
                .paymentDate(payrollRecord.getPaymentDate())
                .periodStart(payrollRecord.getPeriodStart())
                .periodEnd(payrollRecord.getPeriodEnd())
                .paymentMethod(transaction == null ? null : transaction.getPaymentMethod())
                .notes(payrollRecord.getNotes())
                .transactionId(transaction == null ? null : transaction.getId())
                .build();
    }

    private long monthsEmployed(Employee employee) {
        if (employee.getFirstWorkingDay() == null) {
            return 0;
        }

        return Period.between(employee.getFirstWorkingDay(), LocalDate.now()).toTotalMonths();
    }
}