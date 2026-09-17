package com.example.backend.mapper;

import com.example.backend.dto.response.TransactionCategoryResponse;
import com.example.backend.dto.response.TransactionResponse;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.TransactionCategory;
import org.springframework.stereotype.Component;

@Component
public class FinanceMapper {

    public TransactionCategoryResponse toCategoryResponse(TransactionCategory category) {
        return TransactionCategoryResponse.builder()
                .id(category.getId())
                .type(category.getType())
                .name(category.getName())
                .systemKey(category.getSystemKey())
                .active(category.isActive())
                .displayOrder(category.getDisplayOrder())
                .build();
    }

    public TransactionResponse toTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .transactionDate(transaction.getTransactionDate())
                .categoryId(transaction.getCategory().getId())
                .categoryName(transaction.getCategory().getName())
                .paymentMethod(transaction.getPaymentMethod())
                .notes(transaction.getNotes())
                .employeeId(transaction.getEmployee() == null ? null : transaction.getEmployee().getId())
                .employeeName(transaction.getEmployee() == null ? null : transaction.getEmployee().fullName())
                    .menuItemId(transaction.getMenuItem() == null ? null : transaction.getMenuItem().getId())
                    .menuItemName(transaction.getMenuItem() == null ? null : transaction.getMenuItem().getName())
                .payrollRecordId(transaction.getPayrollRecord() == null ? null : transaction.getPayrollRecord().getId())
                .build();
    }
}