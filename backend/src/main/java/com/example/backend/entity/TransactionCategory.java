package com.example.backend.entity;

import com.example.backend.enums.TransactionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(
        name = "transaction_categories",
        indexes = {
                @Index(name = "idx_transaction_categories_type", columnList = "type"),
                @Index(name = "idx_transaction_categories_active", columnList = "active"),
                @Index(name = "idx_transaction_categories_system_key", columnList = "systemKey", unique = true)
        }
)
public class TransactionCategory extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionType type;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 80, unique = true)
    private String systemKey;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Integer displayOrder = 0;
}