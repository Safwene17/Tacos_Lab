package com.example.backend.controller;

import com.example.backend.dto.request.EmployeeRequest;
import com.example.backend.dto.request.PayrollRecordRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.EmployeeResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.response.PayrollRecordResponse;
import com.example.backend.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/admin/employees", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class AdminEmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponse>>> employees(
            @PageableDefault(size = 20, sort = "lastName") Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Employees retrieved successfully",PageResponse.from(employeeService.getEmployees(pageable)))
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> employee(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Employee retrieved successfully",employeeService.getEmployee(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Employee created successfully ", employeeService.createEmployee(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable UUID id,
            @Valid @RequestBody EmployeeRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Employee updated successfully",employeeService.updateEmployee(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable UUID id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{employeeId}/payroll")
    public ResponseEntity<ApiResponse<PageResponse<PayrollRecordResponse>>> payrollRecords(
            @PathVariable UUID employeeId,
            @PageableDefault(size = 20, sort = "paymentDate") Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("payroll retrieved successfully",PageResponse.from(employeeService.getPayrollRecords(employeeId, pageable)))
        );
    }

    @PostMapping("/{employeeId}/payroll")
    public ResponseEntity<ApiResponse<PayrollRecordResponse>> createPayrollRecord(
            @PathVariable UUID employeeId,
            @Valid @RequestBody PayrollRecordRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Payroll created successfully", employeeService.createPayrollRecord(employeeId, request)));
    }

    @PutMapping("/payroll-records/{payrollRecordId}")
    public ResponseEntity<ApiResponse<PayrollRecordResponse>> updatePayrollRecord(
            @PathVariable UUID payrollRecordId,
            @Valid @RequestBody PayrollRecordRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Payroll updated successfully",employeeService.updatePayrollRecord(payrollRecordId, request))
        );
    }

    @DeleteMapping("/payroll-records/{payrollRecordId}")
    public ResponseEntity<Void> deletePayrollRecord(@PathVariable UUID payrollRecordId) {
        employeeService.deletePayrollRecord(payrollRecordId);
        return ResponseEntity.noContent().build();
    }
}