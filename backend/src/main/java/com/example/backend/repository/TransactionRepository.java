package com.example.backend.repository;

import com.example.backend.enums.PaymentMethod;
import com.example.backend.entity.PayrollRecord;
import com.example.backend.entity.Transaction;
import com.example.backend.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByPayrollRecord(PayrollRecord payrollRecord);

    @Query("""
            select coalesce(sum(t.amount), 0)
            from Transaction t
            where t.type = :type
              and t.transactionDate >= :from
              and t.transactionDate <= :to
            """)
    BigDecimal sumByTypeBetween(TransactionType type, LocalDate from, LocalDate to);

    @Query("""
            select coalesce(sum(t.amount), 0)
            from Transaction t
            where t.payrollRecord is not null
              and t.transactionDate >= :from
              and t.transactionDate <= :to
            """)
    BigDecimal sumPayrollBetween(LocalDate from, LocalDate to);

    @Query("""
            select count(t)
            from Transaction t
            where t.payrollRecord is not null
              and t.transactionDate >= :from
              and t.transactionDate <= :to
            """)
    long countPayrollTransactionsBetween(LocalDate from, LocalDate to);

    @Query("""
            select t.category.id as categoryId,
                   t.category.name as categoryName,
                   t.type as type,
                   coalesce(sum(t.amount), 0) as total
            from Transaction t
            where (:type is null or t.type = :type)
              and t.transactionDate >= :from
              and t.transactionDate <= :to
            group by t.category.id, t.category.name, t.type
            order by coalesce(sum(t.amount), 0) desc
            """)
    List<CategoryBreakdownProjection> categoryBreakdown(TransactionType type, LocalDate from, LocalDate to);

    @Query("""
            select t.paymentMethod as paymentMethod,
                   coalesce(sum(t.amount), 0) as total
            from Transaction t
            where (:type is null or t.type = :type)
              and t.transactionDate >= :from
              and t.transactionDate <= :to
            group by t.paymentMethod
            order by coalesce(sum(t.amount), 0) desc
            """)
    List<PaymentMethodBreakdownProjection> paymentMethodBreakdown(TransactionType type, LocalDate from, LocalDate to);

    interface CategoryBreakdownProjection {
        UUID getCategoryId();

        String getCategoryName();

        TransactionType getType();

        BigDecimal getTotal();
    }

    interface PaymentMethodBreakdownProjection {
        PaymentMethod getPaymentMethod();

        BigDecimal getTotal();
    }
}