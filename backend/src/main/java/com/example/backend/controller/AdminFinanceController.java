package com.example.backend.controller;

import com.example.backend.dto.request.TransactionCategoryRequest;
import com.example.backend.dto.request.TransactionRequest;
import com.example.backend.dto.response.*;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.TransactionType;
import com.example.backend.service.FinanceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin")
public class AdminFinanceController {

    private final FinanceService financeService;

    @GetMapping("/transaction-categories")
    public ResponseEntity<ApiResponse<PageResponse<TransactionCategoryResponse>>> categories(
            @PageableDefault(size = 50, sort = "displayOrder") Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Transaction categories retrieved successfully",
                        PageResponse.from(financeService.getCategories(pageable)))
        );
    }

    @GetMapping("/transaction-categories/active")
    public ResponseEntity<ApiResponse<List<TransactionCategoryResponse>>> activeCategoriesByType(
            @RequestParam TransactionType type
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Active categories retrieved successfully",
                        financeService.getActiveCategoriesByType(type))
        );
    }

    @PostMapping("/transaction-categories")
    public ResponseEntity<ApiResponse<TransactionCategoryResponse>> createCategory(
            @Valid @RequestBody TransactionCategoryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Transaction category created successfully",
                        financeService.createCategory(request)));
    }

    @PutMapping("/transaction-categories/{id}")
    public ResponseEntity<ApiResponse<TransactionCategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody TransactionCategoryRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Transaction category updated successfully",
                        financeService.updateCategory(id, request))
        );
    }

    @DeleteMapping("/transaction-categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        financeService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Transaction category deleted successfully", null));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> transactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @PageableDefault(size = 20, sort = "transactionDate") Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Transactions retrieved successfully",
                        PageResponse.from(financeService.getTransactions(type, from, to, categoryId, employeeId, paymentMethod, pageable)))
        );
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> transaction(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Transaction retrieved successfully", financeService.getTransaction(id))
        );
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Transaction created successfully",
                        financeService.createTransaction(request)));
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Transaction updated successfully",
                        financeService.updateTransaction(id, request))
        );
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable UUID id) {
        financeService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.ok("Transaction deleted successfully", null));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Dashboard summary retrieved successfully", financeService.summary(from, to))
        );
    }

    @GetMapping("/dashboard/monthly")
    public ResponseEntity<ApiResponse<List<PeriodFinancialStatResponse>>> monthly(
            @RequestParam @Min(2020) @Max(2100) int year
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Monthly statistics retrieved successfully", financeService.monthlyStats(year))
        );
    }

    @GetMapping("/dashboard/weekly")
    public ResponseEntity<ApiResponse<List<PeriodFinancialStatResponse>>> weekly(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Weekly statistics retrieved successfully", financeService.weeklyStats(from, to))
        );
    }

    @GetMapping("/dashboard/by-category")
    public ResponseEntity<ApiResponse<List<CategoryBreakdownResponse>>> byCategory(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Category breakdown retrieved successfully",
                        financeService.categoryBreakdown(type, from, to))
        );
    }

    @GetMapping("/dashboard/payment-methods")
    public ResponseEntity<ApiResponse<List<PaymentMethodBreakdownResponse>>> paymentMethods(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Payment methods breakdown retrieved successfully",
                        financeService.paymentMethodBreakdown(type, from, to))
        );
    }

    @GetMapping("/dashboard/payroll-summary")
    public ResponseEntity<ApiResponse<PayrollSummaryResponse>> payrollSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Payroll summary retrieved successfully", financeService.payrollSummary(from, to))
        );
    }
}