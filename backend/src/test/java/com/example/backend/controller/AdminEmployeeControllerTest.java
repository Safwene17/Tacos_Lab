package com.example.backend.controller;

import com.example.backend.dto.request.EmployeeRequest;
import com.example.backend.dto.request.PayrollRecordRequest;
import com.example.backend.dto.response.EmployeeResponse;
import com.example.backend.dto.response.PayrollRecordResponse;
import com.example.backend.enums.EmployeeStatus;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.exception.GlobalExceptionHandler;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.EmployeeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AdminEmployeeController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("AdminEmployeeController")
class AdminEmployeeControllerTest {

    private static final UUID EMPLOYEE_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID PAYROLL_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID TRANSACTION_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;

    @MockitoBean
    private EmployeeService employeeService;

    AdminEmployeeControllerTest(MockMvc mockMvc, ObjectMapper objectMapper) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
    }

    @Nested
    @DisplayName("employee endpoints")
    class EmployeeEndpoints {

        @Test
        @DisplayName("should return 200 and paginated employees when employees are requested")
        void shouldReturn200AndPaginatedEmployeesWhenEmployeesAreRequested() throws Exception {
            when(employeeService.getEmployees(any()))
                    .thenReturn(new PageImpl<>(List.of(employeeResponse()), PageRequest.of(0, 20), 1));

            mockMvc.perform(get("/api/admin/employees"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.status").value(200))
                    .andExpect(jsonPath("$.message").value("Employees retrieved successfully"))
                    .andExpect(jsonPath("$.data.content[0].id").value(EMPLOYEE_ID.toString()))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("should return 200 and employee when employee exists")
        void shouldReturn200AndEmployeeWhenEmployeeExists() throws Exception {
            when(employeeService.getEmployee(EMPLOYEE_ID)).thenReturn(employeeResponse());

            mockMvc.perform(get("/api/admin/employees/{id}", EMPLOYEE_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(EMPLOYEE_ID.toString()))
                    .andExpect(jsonPath("$.data.firstName").value("Alex"));
        }

        @Test
        @DisplayName("should return 404 when service throws ResourceNotFoundException")
        void shouldReturn400WhenServiceThrowsResourceNotFoundException() throws Exception {
            when(employeeService.getEmployee(EMPLOYEE_ID))
                    .thenThrow(new ResourceNotFoundException("Employee not found "));

            mockMvc.perform(get("/api/admin/employees/{id}", EMPLOYEE_ID))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("Employee not found "));
        }

        @Test
        @DisplayName("should return 201 when employee is created")
        void shouldReturn201WhenEmployeeIsCreated() throws Exception {
            when(employeeService.createEmployee(any(EmployeeRequest.class))).thenReturn(employeeResponse());

            mockMvc.perform(post("/api/admin/employees")
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(employeeRequest())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.status").value(201))
                    .andExpect(jsonPath("$.message").value("Employee created successfully "))
                    .andExpect(jsonPath("$.data.id").value(EMPLOYEE_ID.toString()));
        }

        @Test
        @DisplayName("should return 400 and errors map when employee request is invalid")
        void shouldReturn400AndErrorsMapWhenEmployeeRequestIsInvalid() throws Exception {
            EmployeeRequest invalidRequest = new EmployeeRequest(
                    "",
                    "",
                    "",
                    "invalid-email",
                    BigDecimal.ZERO,
                    "Cook",
                    null,
                    LocalDate.now().plusDays(1),
                    null,
                    null,
                    null
            );

            mockMvc.perform(post("/api/admin/employees")
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.errors.firstName").exists())
                    .andExpect(jsonPath("$.errors.lastName").exists())
                    .andExpect(jsonPath("$.errors.phoneNumber").exists())
                    .andExpect(jsonPath("$.errors.salaryAmount").exists())
                    .andExpect(jsonPath("$.errors.employmentStatus").exists());
        }

        @Test
        @DisplayName("should return 200 when employee is updated")
        void shouldReturn200WhenEmployeeIsUpdated() throws Exception {
            when(employeeService.updateEmployee(eq(EMPLOYEE_ID), any(EmployeeRequest.class)))
                    .thenReturn(employeeResponse());

            mockMvc.perform(put("/api/admin/employees/{id}", EMPLOYEE_ID)
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(employeeRequest())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Employee updated successfully"))
                    .andExpect(jsonPath("$.data.id").value(EMPLOYEE_ID.toString()));
        }

        @Test
        @DisplayName("should return 404 when updating missing employee")
        void shouldReturn404WhenUpdatingMissingEmployee() throws Exception {
            when(employeeService.updateEmployee(eq(EMPLOYEE_ID), any(EmployeeRequest.class)))
                    .thenThrow(new ResourceNotFoundException("Employee not found "));

            mockMvc.perform(put("/api/admin/employees/{id}", EMPLOYEE_ID)
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(employeeRequest())))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.message").value("Employee not found "));
        }

        @Test
        @DisplayName("should return 204 when employee is deleted")
        void shouldReturn204WhenEmployeeIsDeleted() throws Exception {
            mockMvc.perform(delete("/api/admin/employees/{id}", EMPLOYEE_ID))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            verify(employeeService).deleteEmployee(EMPLOYEE_ID);
        }

        @Test
        @DisplayName("should return 404 when deleting missing employee")
        void shouldReturn404WhenDeletingMissingEmployee() throws Exception {
            doThrow(new ResourceNotFoundException("Employee not found "))
                    .when(employeeService)
                    .deleteEmployee(EMPLOYEE_ID);

            mockMvc.perform(delete("/api/admin/employees/{id}", EMPLOYEE_ID))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.message").value("Employee not found "));
        }
    }

    @Nested
    @DisplayName("payroll endpoints")
    class PayrollEndpoints {

        @Test
        @DisplayName("should return 200 and paginated payroll records")
        void shouldReturn200AndPaginatedPayrollRecords() throws Exception {
            when(employeeService.getPayrollRecords(eq(EMPLOYEE_ID), any()))
                    .thenReturn(new PageImpl<>(List.of(payrollResponse()), PageRequest.of(0, 20), 1));

            mockMvc.perform(get("/api/admin/employees/{employeeId}/payroll", EMPLOYEE_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.content[0].id").value(PAYROLL_ID.toString()));
        }

        @Test
        @DisplayName("should return 201 when payroll record is created")
        void shouldReturn201WhenPayrollRecordIsCreated() throws Exception {
            when(employeeService.createPayrollRecord(eq(EMPLOYEE_ID), any(PayrollRecordRequest.class)))
                    .thenReturn(payrollResponse());

            mockMvc.perform(post("/api/admin/employees/{employeeId}/payroll", EMPLOYEE_ID)
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payrollRequest())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.status").value(201))
                    .andExpect(jsonPath("$.data.id").value(PAYROLL_ID.toString()));
        }

        @Test
        @DisplayName("should return 200 when payroll record is updated")
        void shouldReturn200WhenPayrollRecordIsUpdated() throws Exception {
            when(employeeService.updatePayrollRecord(eq(PAYROLL_ID), any(PayrollRecordRequest.class)))
                    .thenReturn(payrollResponse());

            mockMvc.perform(put("/api/admin/employees/payroll-records/{payrollRecordId}", PAYROLL_ID)
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payrollRequest())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(PAYROLL_ID.toString()));
        }

        @Test
        @DisplayName("should return 204 when payroll record is deleted")
        void shouldReturn204WhenPayrollRecordIsDeleted() throws Exception {
            mockMvc.perform(delete("/api/admin/employees/payroll-records/{payrollRecordId}", PAYROLL_ID))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            verify(employeeService).deletePayrollRecord(PAYROLL_ID);
        }
    }

    private EmployeeRequest employeeRequest() {
        return new EmployeeRequest(
                "Alex",
                "Popescu",
                "+40740000000",
                "alex@example.com",
                BigDecimal.valueOf(3500),
                "Cook",
                EmployeeStatus.ACTIVE,
                LocalDate.of(2025, 1, 1),
                "Maria Popescu",
                "+40741111111",
                "Morning shift"
        );
    }

    private EmployeeResponse employeeResponse() {
        return EmployeeResponse.builder()
                .id(EMPLOYEE_ID)
                .firstName("Alex")
                .lastName("Popescu")
                .fullName("Alex Popescu")
                .phoneNumber("+40740000000")
                .email("alex@example.com")
                .salaryAmount(BigDecimal.valueOf(3500))
                .salaryCurrency("RON")
                .role("Cook")
                .employmentStatus(EmployeeStatus.ACTIVE)
                .firstWorkingDay(LocalDate.of(2025, 1, 1))
                .payrollRecordsCount(0)
                .monthsEmployed(12)
                .build();
    }

    private PayrollRecordRequest payrollRequest() {
        return new PayrollRecordRequest(
                BigDecimal.valueOf(3500),
                LocalDate.of(2026, 5, 1),
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 30),
                PaymentMethod.BANK_TRANSFER,
                "April salary"
        );
    }

    private PayrollRecordResponse payrollResponse() {
        return PayrollRecordResponse.builder()
                .id(PAYROLL_ID)
                .employeeId(EMPLOYEE_ID)
                .employeeName("Alex Popescu")
                .amount(BigDecimal.valueOf(3500))
                .currency("RON")
                .paymentDate(LocalDate.of(2026, 5, 1))
                .periodStart(LocalDate.of(2026, 4, 1))
                .periodEnd(LocalDate.of(2026, 4, 30))
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .notes("April salary")
                .transactionId(TRANSACTION_ID)
                .build();
    }
}