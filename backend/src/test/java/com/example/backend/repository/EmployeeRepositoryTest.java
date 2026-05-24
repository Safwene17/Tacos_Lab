package com.example.backend.repository;

import com.example.backend.entity.Employee;
import com.example.backend.enums.EmployeeStatus;
import com.example.backend.integration.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;


@Testcontainers
@DisplayName("EmployeeRepository")
class EmployeeRepositoryTest extends AbstractIntegrationTest {

    private static final String FIRST_NAME = "Alex";
    private static final String LAST_NAME = "Popescu";

    private final EmployeeRepository employeeRepository;

    EmployeeRepositoryTest(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Test
    @DisplayName("should find employee by id after save")
    void shouldFindEmployeeByIdAfterSave() {
        Employee saved = employeeRepository.save(employee());

        Optional<Employee> result = employeeRepository.findById(saved.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getFirstName()).isEqualTo(FIRST_NAME);
        assertThat(result.get().getLastName()).isEqualTo(LAST_NAME);
    }

    @Test
    @DisplayName("should remove employee from database when deleted")
    void shouldRemoveEmployeeFromDatabaseWhenDeleted() {
        Employee saved = employeeRepository.save(employee());

        employeeRepository.delete(saved);
        employeeRepository.flush();

        Optional<Employee> result = employeeRepository.findById(saved.getId());

        assertThat(result).isEmpty();
    }

    private Employee employee() {
        Employee employee = new Employee();
        employee.setFirstName(FIRST_NAME);
        employee.setLastName(LAST_NAME);
        employee.setPhoneNumber("+40740000000");
        employee.setEmail("alex@example.com");
        employee.setSalaryAmount(BigDecimal.valueOf(3500));
        employee.setSalaryCurrency("RON");
        employee.setRole("Cook");
        employee.setEmploymentStatus(EmployeeStatus.ACTIVE);
        employee.setFirstWorkingDay(LocalDate.of(2025, 1, 1));
        employee.setEmergencyContactName("Maria Popescu");
        employee.setEmergencyContactPhone("+40741111111");
        employee.setNotes("Morning shift");
        return employee;
    }
}