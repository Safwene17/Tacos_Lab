package com.example.backend.mapper;

import com.example.backend.constant.AppConstants;
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

    public PublicCategoryResponse toPublicCategory(Category category, String locale) {
        return PublicCategoryResponse.builder()
                .id(category.getId())
                .name(localized(category.getNameEn(), category.getNameRo(), locale))
                .markAsNew(category.isMarkAsNew())
                .displayOrder(category.getDisplayOrder())
                .build();
    }

    public AdminCategoryResponse toAdminCategory(Category category) {
        return AdminCategoryResponse.builder()
                .id(category.getId())
                .nameEn(category.getNameEn())
                .nameRo(category.getNameRo())
                .markAsNew(category.isMarkAsNew())
                .active(category.isActive())
                .displayOrder(category.getDisplayOrder())
                .build();
    }

    public PublicMenuItemResponse toPublicMenuItem(
            MenuItem item,
            List<MediaAsset> images,
            String locale
    ) {
        return PublicMenuItemResponse.builder()
                .id(item.getId())
                .name(localized(item.getNameEn(), item.getNameRo(), locale))
                .description(localized(item.getDescriptionEn(), item.getDescriptionRo(), locale))
                .price(item.getPrice())
                .currency(item.getCurrency())
                .weightLabel(item.getWeightLabel())
                .markAsNew(item.isMarkAsNew())
                .popular(item.isPopular())
                .categoryId(item.getCategory().getId())
                .categoryName(localized(item.getCategory().getNameEn(), item.getCategory().getNameRo(), locale))
                .images(images.stream().map(image -> toPublicMediaAsset(image, locale)).toList())
                .build();
    }

    public AdminMenuItemResponse toAdminMenuItem(MenuItem item, List<MediaAsset> images) {
        return AdminMenuItemResponse.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .categoryNameEn(item.getCategory().getNameEn())
                .nameEn(item.getNameEn())
                .nameRo(item.getNameRo())
                .descriptionEn(item.getDescriptionEn())
                .descriptionRo(item.getDescriptionRo())
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

    public PublicMediaAssetResponse toPublicMediaAsset(MediaAsset asset, String locale) {
        return PublicMediaAssetResponse.builder()
                .id(asset.getId())
                .url(asset.getSecureUrl())
                .alt(localized(asset.getAltEn(), asset.getAltRo(), locale))
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
                .altEn(asset.getAltEn())
                .altRo(asset.getAltRo())
                .primary(asset.isPrimary())
                .displayOrder(asset.getDisplayOrder())
                .build();
    }

    private String localized(String en, String ro, String locale) {
        if (AppConstants.ROMANIAN_LOCALE.equals(locale)) {
            return ro != null && !ro.isBlank() ? ro : en;
        }

        return en;
    }
}