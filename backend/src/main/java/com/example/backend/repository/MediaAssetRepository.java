package com.example.backend.repository;

import com.example.backend.entity.MediaAsset;
import com.example.backend.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, UUID> {

    List<MediaAsset> findAllByMenuItemOrderByDisplayOrderAsc(MenuItem menuItem);

    Optional<MediaAsset> findByIdAndMenuItemId(UUID id, UUID menuItemId);

    boolean existsByMenuItem(MenuItem menuItem);

    @Query("""
            select coalesce(max(asset.displayOrder), -1)
            from MediaAsset asset
            where asset.menuItem.id = :menuItemId
            """)
    int findMaxDisplayOrderByMenuItemId(UUID menuItemId);

    @Modifying
    @Query("""
            update MediaAsset asset
            set asset.primary = false
            where asset.menuItem.id = :menuItemId
            """)
    void unsetPrimaryForMenuItem(UUID menuItemId);
}