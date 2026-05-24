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

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(
        name = "menu_items",
        indexes = {
                @Index(name = "idx_menu_items_category_id", columnList = "category_id"),
                @Index(name = "idx_menu_items_active", columnList = "active"),
                @Index(name = "idx_menu_items_display_order", columnList = "category_id, displayOrder")
        }
)
public class MenuItem extends BaseEntity {

    // DB-level cascade: deleting a Category deletes all its MenuItems
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Category category;

    @Column(nullable = false, length = 180)
    private String nameEn;

    @Column(nullable = false, length = 180)
    private String nameRo;

    @Column(columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(columnDefinition = "TEXT")
    private String descriptionRo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    private String currency = AppConstants.CURRENCY_RON;

    @Column(length = 50)
    private String weightLabel;

    @Column(nullable = false)
    private boolean markAsNew = false;

    @Column(nullable = false)
    private boolean popular = false;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Integer displayOrder = 0;
}