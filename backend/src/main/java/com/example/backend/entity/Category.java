package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
        name = "categories",
        indexes = @Index(name = "idx_categories_display_order", columnList = "displayOrder")
)
public class Category extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String nameEn;

    @Column(nullable = false, length = 150)
    private String nameRo;

    @Column(nullable = false)
    private boolean markAsNew = false;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Integer displayOrder = 0;
}