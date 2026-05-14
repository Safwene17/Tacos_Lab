package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "media_assets")
public class MediaAsset extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "menu_item_id", nullable = false)
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