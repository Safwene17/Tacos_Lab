package com.example.backend.service;

import com.example.backend.constant.AppConstants;
import com.example.backend.dto.request.TransactionCategoryRequest;
import com.example.backend.dto.request.TransactionRequest;
import com.example.backend.dto.response.CategoryBreakdownResponse;
import com.example.backend.dto.response.DashboardSummaryResponse;
import com.example.backend.dto.response.PaymentMethodBreakdownResponse;
import com.example.backend.dto.response.PayrollSummaryResponse;
import com.example.backend.dto.response.PeriodFinancialStatResponse;
import com.example.backend.dto.response.TransactionCategoryResponse;
import com.example.backend.dto.response.TransactionResponse;
import com.example.backend.entity.Employee;
import com.example.backend.entity.MenuItem;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.TransactionCategory;
import com.example.backend.enums.TransactionType;
import com.example.backend.exception.BusinessException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.FinanceMapper;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.MenuItemRepository;
import com.example.backend.repository.TransactionCategoryRepository;
import com.example.backend.repository.TransactionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final TransactionRepository transactionRepository;
    private final TransactionCategoryRepository transactionCategoryRepository;
    private final EmployeeRepository employeeRepository;
    private final MenuItemRepository menuItemRepository;
    private final FinanceMapper financeMapper;

    @Transactional(readOnly = true)
    public Page<TransactionCategoryResponse> getCategories(Pageable pageable) {
        return transactionCategoryRepository.findAll(pageable)
                .map(financeMapper::toCategoryResponse);
    }

    @Transactional(readOnly = true)
    public List<TransactionCategoryResponse> getActiveCategoriesByType(TransactionType type) {
        return transactionCategoryRepository
                .findAllByTypeAndActiveTrueOrderByDisplayOrderAsc(type)
                .stream()
                .map(financeMapper::toCategoryResponse)
                .toList();
    }

    @Transactional
    public TransactionCategoryResponse createCategory(TransactionCategoryRequest request) {
        TransactionCategory category = new TransactionCategory();
        applyCategoryRequest(category, request);

        return financeMapper.toCategoryResponse(transactionCategoryRepository.save(category));
    }

    @Transactional
    public TransactionCategoryResponse updateCategory(UUID id, TransactionCategoryRequest request) {
        TransactionCategory category = findCategory(id);
        applyCategoryRequest(category, request);

        return financeMapper.toCategoryResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        TransactionCategory category = findCategory(id);

        if (category.getSystemKey() != null && !category.getSystemKey().isBlank()) {
            throw new BusinessException("Seeded system categories cannot be deleted.");
        }

        category.setActive(false);
        transactionCategoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(
            TransactionType type,
            LocalDate from,
            LocalDate to,
            UUID categoryId,
            UUID employeeId,
            PaymentMethod paymentMethod,
            Pageable pageable
    ) {
        Specification<Transaction> specification = transactionFilters(
                type,
                from,
                to,
                categoryId,
                employeeId,
                paymentMethod
        );

        return transactionRepository.findAll(specification, pageable)
                .map(financeMapper::toTransactionResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(UUID id) {
        return financeMapper.toTransactionResponse(findTransaction(id));
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        TransactionCategory category = findCategory(request.categoryId());
        validateCategoryMatchesTransactionType(category, request.type());

        Transaction transaction = new Transaction();
        applyTransactionRequest(transaction, request, category);

        return financeMapper.toTransactionResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse updateTransaction(UUID id, TransactionRequest request) {
        Transaction transaction = findTransaction(id);

        if (transaction.getPayrollRecord() != null) {
            throw new BusinessException("Payroll-linked transactions must be updated through payroll records.");
        }

        TransactionCategory category = findCategory(request.categoryId());
        validateCategoryMatchesTransactionType(category, request.type());

        applyTransactionRequest(transaction, request, category);

        return financeMapper.toTransactionResponse(transaction);
    }

    @Transactional
    public void deleteTransaction(UUID id) {
        Transaction transaction = findTransaction(id);

        if (transaction.getPayrollRecord() != null) {
            throw new BusinessException("Payroll-linked transactions must be deleted through payroll records.");
        }

        transactionRepository.delete(transaction);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary(LocalDate from, LocalDate to) {
        DateRange range = resolveRange(from, to);

        BigDecimal income = transactionRepository.sumByTypeBetween(TransactionType.INCOME, range.from(), range.to());
        BigDecimal expenses = transactionRepository.sumByTypeBetween(TransactionType.EXPENSE, range.from(), range.to());

        return DashboardSummaryResponse.builder()
                .from(range.from())
                .to(range.to())
                .totalIncome(income)
                .totalExpenses(expenses)
                .netProfit(income.subtract(expenses))
                .build();
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownResponse> categoryBreakdown(TransactionType type, LocalDate from, LocalDate to) {
        DateRange range = resolveRange(from, to);

        return transactionRepository.categoryBreakdown(type, range.from(), range.to())
                .stream()
                .map(row -> CategoryBreakdownResponse.builder()
                        .categoryId(row.getCategoryId())
                        .categoryName(row.getCategoryName())
                        .type(row.getType())
                        .total(row.getTotal())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentMethodBreakdownResponse> paymentMethodBreakdown(TransactionType type, LocalDate from, LocalDate to) {
        DateRange range = resolveRange(from, to);

        return transactionRepository.paymentMethodBreakdown(type, range.from(), range.to())
                .stream()
                .map(row -> PaymentMethodBreakdownResponse.builder()
                        .paymentMethod(row.getPaymentMethod())
                        .total(row.getTotal())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public PayrollSummaryResponse payrollSummary(LocalDate from, LocalDate to) {
        DateRange range = resolveRange(from, to);

        return PayrollSummaryResponse.builder()
                .from(range.from())
                .to(range.to())
                .totalPayroll(transactionRepository.sumPayrollBetween(range.from(), range.to()))
                .payrollTransactionsCount(transactionRepository.countPayrollTransactionsBetween(range.from(), range.to()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<PeriodFinancialStatResponse> monthlyStats(int year) {
        List<PeriodFinancialStatResponse> stats = new ArrayList<>();

        for (Month month : Month.values()) {
            LocalDate from = LocalDate.of(year, month, 1);
            LocalDate to = from.with(TemporalAdjusters.lastDayOfMonth());

            BigDecimal income = transactionRepository.sumByTypeBetween(TransactionType.INCOME, from, to);
            BigDecimal expenses = transactionRepository.sumByTypeBetween(TransactionType.EXPENSE, from, to);

            stats.add(PeriodFinancialStatResponse.builder()
                    .period(month.name())
                    .income(income)
                    .expenses(expenses)
                    .netProfit(income.subtract(expenses))
                    .build());
        }

        return stats;
    }

    @Transactional(readOnly = true)
    public List<PeriodFinancialStatResponse> weeklyStats(LocalDate from, LocalDate to) {
        DateRange range = resolveRange(from, to);

        List<PeriodFinancialStatResponse> stats = new ArrayList<>();

        LocalDate weekStart = range.from().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        while (!weekStart.isAfter(range.to())) {
            LocalDate weekEnd = weekStart.plusDays(6);

            LocalDate effectiveFrom = weekStart.isBefore(range.from()) ? range.from() : weekStart;
            LocalDate effectiveTo = weekEnd.isAfter(range.to()) ? range.to() : weekEnd;

            BigDecimal income = transactionRepository.sumByTypeBetween(TransactionType.INCOME, effectiveFrom, effectiveTo);
            BigDecimal expenses = transactionRepository.sumByTypeBetween(TransactionType.EXPENSE, effectiveFrom, effectiveTo);

            stats.add(PeriodFinancialStatResponse.builder()
                    .period(effectiveFrom + " to " + effectiveTo)
                    .income(income)
                    .expenses(expenses)
                    .netProfit(income.subtract(expenses))
                    .build());

            weekStart = weekStart.plusWeeks(1);
        }

        return stats;
    }

    private void applyCategoryRequest(TransactionCategory category, TransactionCategoryRequest request) {
        category.setType(request.type());
        category.setName(request.name());
        category.setSystemKey(normalizeSystemKey(request.systemKey()));
        category.setActive(request.active());
        category.setDisplayOrder(request.displayOrder());
    }

    private void applyTransactionRequest(
            Transaction transaction,
            TransactionRequest request,
            TransactionCategory category
    ) {
        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setCurrency(AppConstants.CURRENCY_RON);
        transaction.setTransactionDate(request.transactionDate());
        transaction.setCategory(category);
        transaction.setPaymentMethod(request.paymentMethod());
        transaction.setNotes(request.notes());
        transaction.setEmployee(resolveEmployee(request.employeeId()));
        transaction.setMenuItem(resolveMenuItem(request.menuItemId()));
    }

    private Specification<Transaction> transactionFilters(
            TransactionType type,
            LocalDate from,
            LocalDate to,
            UUID categoryId,
            UUID employeeId,
            PaymentMethod paymentMethod
    ) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();


            if (type != null) {
                predicates.add(builder.equal(root.get("type"), type));
            }

            if (from != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("transactionDate"), from));
            }

            if (to != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("transactionDate"), to));
            }

            if (categoryId != null) {
                predicates.add(builder.equal(root.get("category").get("id"), categoryId));
            }

            if (employeeId != null) {
                predicates.add(builder.equal(root.get("employee").get("id"), employeeId));
            }

            if (paymentMethod != null) {
                predicates.add(builder.equal(root.get("paymentMethod"), paymentMethod));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void validateCategoryMatchesTransactionType(TransactionCategory category, TransactionType transactionType) {
        if (category.getType() != transactionType) {
            throw new BusinessException("Transaction category type does not match transaction type.");
        }

        if (!category.isActive()) {
            throw new BusinessException("Transaction category is inactive.");
        }
    }

    private TransactionCategory findCategory(UUID id) {
        return transactionCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction category not found"));
    }

    private Transaction findTransaction(UUID id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found "));
    }

    private Employee resolveEmployee(UUID employeeId) {
        if (employeeId == null) {
            return null;
        }

        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }

    private MenuItem resolveMenuItem(UUID menuItemId) {
        if (menuItemId == null) {
            return null;
        }

        return menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
    }

    private String normalizeSystemKey(String systemKey) {
        if (systemKey == null || systemKey.isBlank()) {
            return null;
        }

        return systemKey.trim().toUpperCase();
    }

    private DateRange resolveRange(LocalDate from, LocalDate to) {
        LocalDate resolvedTo = to == null ? LocalDate.now() : to;
        LocalDate resolvedFrom = from == null ? resolvedTo.withDayOfMonth(1) : from;

        if (resolvedFrom.isAfter(resolvedTo)) {
            throw new BusinessException("Start date must be before or equal to end date.");
        }

        return new DateRange(resolvedFrom, resolvedTo);
    }

    private record DateRange(LocalDate from, LocalDate to) {
    }
}