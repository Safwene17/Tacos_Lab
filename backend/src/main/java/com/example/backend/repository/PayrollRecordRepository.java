package com.example.backend.repository;

import com.example.backend.entity.Employee;
import com.example.backend.entity.PayrollRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, UUID> {

    Page<PayrollRecord> findAllByEmployeeOrderByPaymentDateDesc(Employee employee, Pageable pageable);

    Optional<PayrollRecord> findFirstByEmployeeOrderByPaymentDateDesc(Employee employee);

    long countByEmployee(Employee employee);
}