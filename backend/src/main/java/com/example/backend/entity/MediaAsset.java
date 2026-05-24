package com.example.backend.entity;

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

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(
        name = "media_assets",
        indexes = {
                @Index(name = "idx_media_assets_menu_item_id", columnList = "menu_item_id"),
                @Index(name = "idx_media_assets_primary", columnList = "menu_item_id, is_primary")
        }
)
public class MediaAsset extends BaseEntity {

    // DB-level cascade: deleting a MenuItem deletes all its MediaAssets
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_item_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private MenuItem menuItem;

    @Column(nullable = false, unique = true)
    private String publicId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String secureUrl;

    @Column(nullable = false, length = 50)
    private String resourceType;

    @Column(length = 30)
    private String format;

    @Column
    private Integer width;

    @Column
    private Integer height;

    @Column
    private Long bytes;

    @Column(length = 80)
    private String version;

    @Column
    private String folder;

    @Column
    private String altEn;

    @Column
    private String altRo;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;
}