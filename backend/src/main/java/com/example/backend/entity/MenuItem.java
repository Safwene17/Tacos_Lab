package com.example.backend.entity;

import com.example.backend.constant.AppConstants;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> ingredients = new ArrayList<>();

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

    // One-to-Many with cascade delete: when MenuItem is deleted, all its MediaAssets are deleted
    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<MediaAsset> mediaAssets = new HashSet<>();
}