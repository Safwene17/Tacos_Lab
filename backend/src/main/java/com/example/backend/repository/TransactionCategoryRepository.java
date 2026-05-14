package com.example.backend.repository;

import com.example.backend.entity.TransactionCategory;
import com.example.backend.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionCategoryRepository extends JpaRepository<TransactionCategory, UUID> {

    Optional<TransactionCategory> findBySystemKey(String systemKey);

    Page<TransactionCategory> findAll(Pageable pageable);

    List<TransactionCategory> findAllByTypeAndActiveTrueOrderByDisplayOrderAsc(TransactionType type);
}