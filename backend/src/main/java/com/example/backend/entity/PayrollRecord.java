package com.example.backend.entity;

import com.example.backend.constant.AppConstants;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
        name = "payroll_records",
        indexes = {
                @Index(name = "idx_payroll_records_employee_id", columnList = "employee_id"),
                @Index(name = "idx_payroll_records_payment_date", columnList = "employee_id, paymentDate")
        }
)
public class PayrollRecord extends BaseEntity {

    // DB-level cascade: deleting an Employee deletes all their PayrollRecords
    // (Transaction linked to PayrollRecord also cascades — see Transaction entity)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Employee employee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = AppConstants.CURRENCY_RON;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Column
    private LocalDate periodStart;

    @Column
    private LocalDate periodEnd;

    @Column(columnDefinition = "TEXT")
    private String notes;
}