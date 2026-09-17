package com.example.backend.mapper;

import com.example.backend.dto.response.AdminCategoryResponse;
import com.example.backend.dto.response.AdminMediaAssetResponse;
import com.example.backend.dto.response.AdminMenuItemResponse;
import com.example.backend.dto.response.PublicCategoryResponse;
import com.example.backend.dto.response.PublicMediaAssetResponse;
import com.example.backend.dto.response.PublicMenuItemResponse;
import com.example.backend.entity.Category;
import com.example.backend.entity.MediaAsset;
import com.example.backend.entity.MenuItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MenuMapper {

    public PublicCategoryResponse toPublicCategory(Category category) {
        return PublicCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .markAsNew(category.isMarkAsNew())
                .displayOrder(category.getDisplayOrder())
                .build();
    }

    public AdminCategoryResponse toAdminCategory(Category category) {
        return AdminCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .markAsNew(category.isMarkAsNew())
                .active(category.isActive())
                .displayOrder(category.getDisplayOrder())
                .build();
    }

        public PublicMenuItemResponse toPublicMenuItem(
            MenuItem item,
            List<MediaAsset> images
        ) {
        return PublicMenuItemResponse.builder()
            .id(item.getId())
            .name(item.getName())
            .description(item.getDescription())
            .ingredients(item.getIngredients())
            .price(item.getPrice())
            .currency(item.getCurrency())
            .weightLabel(item.getWeightLabel())
            .markAsNew(item.isMarkAsNew())
            .popular(item.isPopular())
            .categoryId(item.getCategory().getId())
            .categoryName(item.getCategory().getName())
            .images(images.stream().map(this::toPublicMediaAsset).toList())
            .build();
        }

    public AdminMenuItemResponse toAdminMenuItem(MenuItem item, List<MediaAsset> images) {
        return AdminMenuItemResponse.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .name(item.getName())
                .description(item.getDescription())
                .ingredients(item.getIngredients())
                .price(item.getPrice())
                .currency(item.getCurrency())
                .weightLabel(item.getWeightLabel())
                .markAsNew(item.isMarkAsNew())
                .popular(item.isPopular())
                .active(item.isActive())
                .displayOrder(item.getDisplayOrder())
                .images(images.stream().map(this::toAdminMediaAsset).toList())
                .build();
    }

    public PublicMediaAssetResponse toPublicMediaAsset(MediaAsset asset) {
        return PublicMediaAssetResponse.builder()
                .id(asset.getId())
                .url(asset.getSecureUrl())
                .alt(asset.getAlt())
                .primary(asset.isPrimary())
                .displayOrder(asset.getDisplayOrder())
                .build();
    }

    public AdminMediaAssetResponse toAdminMediaAsset(MediaAsset asset) {
        return AdminMediaAssetResponse.builder()
                .id(asset.getId())
                .publicId(asset.getPublicId())
                .secureUrl(asset.getSecureUrl())
                .resourceType(asset.getResourceType())
                .format(asset.getFormat())
                .width(asset.getWidth())
                .height(asset.getHeight())
                .bytes(asset.getBytes())
                .version(asset.getVersion())
                .folder(asset.getFolder())
                .alt(asset.getAlt())
                .primary(asset.isPrimary())
                .displayOrder(asset.getDisplayOrder())
                .build();
    }
    
}