package com.example.backend.entity;

import com.example.backend.constant.AppConstants;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.TransactionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(
        name = "transactions",
        indexes = {
                @Index(name = "idx_transactions_category_id", columnList = "category_id"),
                @Index(name = "idx_transactions_employee_id", columnList = "employee_id"),
                @Index(name = "idx_transactions_menu_item_id", columnList = "menu_item_id"),
                @Index(name = "idx_transactions_payroll_record_id", columnList = "payroll_record_id"),
                @Index(name = "idx_transactions_type_date", columnList = "type, transactionDate"),
                @Index(name = "idx_transactions_date", columnList = "transactionDate")
        }
)
public class Transaction extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = AppConstants.CURRENCY_RON;

    @Column(nullable = false)
    private LocalDate transactionDate;

    // DB-level cascade: deleting a TransactionCategory deletes its Transactions
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private TransactionCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private PaymentMethod paymentMethod;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // SET NULL: deleting an Employee preserves financial history
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Employee employee;

    // SET NULL: deleting a MenuItem preserves financial history
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private MenuItem menuItem;

    // DB-level cascade: deleting a PayrollRecord deletes its linked Transaction
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_record_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private PayrollRecord payrollRecord;
}