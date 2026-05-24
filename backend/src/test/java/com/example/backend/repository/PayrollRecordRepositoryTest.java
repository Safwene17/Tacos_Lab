package com.example.backend.repository;

import com.example.backend.entity.Employee;
import com.example.backend.entity.PayrollRecord;
import com.example.backend.enums.EmployeeStatus;
import com.example.backend.integration.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;


@Testcontainers
@DisplayName("PayrollRecordRepository")
class PayrollRecordRepositoryTest extends AbstractIntegrationTest {

    private final PayrollRecordRepository payrollRecordRepository;
    private final EmployeeRepository employeeRepository;

    PayrollRecordRepositoryTest(
            PayrollRecordRepository payrollRecordRepository,
            EmployeeRepository employeeRepository
    ) {
        this.payrollRecordRepository = payrollRecordRepository;
        this.employeeRepository = employeeRepository;
    }

    @Test
    @DisplayName("should return payroll records ordered by payment date descending")
    void shouldReturnPayrollRecordsOrderedByPaymentDateDescending() {
        Employee employee = employeeRepository.save(employee());
        PayrollRecord older = payrollRecord(employee, LocalDate.of(2026, 4, 1), BigDecimal.valueOf(3000));
        PayrollRecord newer = payrollRecord(employee, LocalDate.of(2026, 5, 1), BigDecimal.valueOf(3500));

        payrollRecordRepository.save(older);
        payrollRecordRepository.save(newer);

        Page<PayrollRecord> result = payrollRecordRepository.findAllByEmployeeOrderByPaymentDateDesc(
                employee,
                PageRequest.of(0, 20)
        );

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getPaymentDate()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(result.getContent().get(1).getPaymentDate()).isEqualTo(LocalDate.of(2026, 4, 1));
    }

    @Test
    @DisplayName("should return most recent payroll record")
    void shouldReturnMostRecentPayrollRecord() {
        Employee employee = employeeRepository.save(employee());

        payrollRecordRepository.save(payrollRecord(employee, LocalDate.of(2026, 4, 1), BigDecimal.valueOf(3000)));
        payrollRecordRepository.save(payrollRecord(employee, LocalDate.of(2026, 5, 1), BigDecimal.valueOf(3500)));

        Optional<PayrollRecord> result = payrollRecordRepository.findFirstByEmployeeOrderByPaymentDateDesc(employee);

        assertThat(result).isPresent();
        assertThat(result.get().getPaymentDate()).isEqualTo(LocalDate.of(2026, 5, 1));
    }

    @Test
    @DisplayName("should count payroll records by employee")
    void shouldCountPayrollRecordsByEmployee() {
        Employee employee = employeeRepository.save(employee());

        payrollRecordRepository.save(payrollRecord(employee, LocalDate.of(2026, 4, 1), BigDecimal.valueOf(3000)));
        payrollRecordRepository.save(payrollRecord(employee, LocalDate.of(2026, 5, 1), BigDecimal.valueOf(3500)));

        long count = payrollRecordRepository.countByEmployee(employee);

        assertThat(count).isEqualTo(2L);
    }

    private Employee employee() {
        Employee employee = new Employee();
        employee.setFirstName("Alex");
        employee.setLastName("Popescu");
        employee.setPhoneNumber("+40740000000");
        employee.setEmail("alex@example.com");
        employee.setSalaryAmount(BigDecimal.valueOf(3500));
        employee.setSalaryCurrency("RON");
        employee.setRole("Cook");
        employee.setEmploymentStatus(EmployeeStatus.ACTIVE);
        employee.setFirstWorkingDay(LocalDate.of(2025, 1, 1));
        return employee;
    }

    private PayrollRecord payrollRecord(Employee employee, LocalDate paymentDate, BigDecimal amount) {
        PayrollRecord payrollRecord = new PayrollRecord();
        payrollRecord.setEmployee(employee);
        payrollRecord.setAmount(amount);
        payrollRecord.setCurrency("RON");
        payrollRecord.setPaymentDate(paymentDate);
        payrollRecord.setPeriodStart(paymentDate.minusMonths(1).withDayOfMonth(1));
        payrollRecord.setPeriodEnd(paymentDate.minusDays(1));
        payrollRecord.setNotes("Salary payment");
        return payrollRecord;
    }
}