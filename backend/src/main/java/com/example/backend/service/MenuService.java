package com.example.backend.service;

import com.example.backend.dto.request.CategoryRequest;
import com.example.backend.dto.request.MediaAssetOrderRequest;
import com.example.backend.dto.request.MediaAssetUpdateRequest;
import com.example.backend.dto.request.MenuItemRequest;
import com.example.backend.dto.response.AdminCategoryResponse;
import com.example.backend.dto.response.AdminMediaAssetResponse;
import com.example.backend.dto.response.AdminMenuItemResponse;
import com.example.backend.dto.response.PublicCategoryResponse;
import com.example.backend.dto.response.PublicMenuCategoryGroupResponse;
import com.example.backend.dto.response.PublicMenuItemResponse;
import com.example.backend.dto.response.PublicMenuResponse;
import com.example.backend.entity.Category;
import com.example.backend.entity.MediaAsset;
import com.example.backend.entity.MenuItem;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.MenuMapper;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.MediaAssetRepository;
import com.example.backend.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final MediaAssetRepository mediaAssetRepository;
    private final CloudinaryService cloudinaryService;
    private final LocaleResolverService localeResolverService;
    private final MenuMapper menuMapper;

    @Transactional(readOnly = true)
    public List<PublicCategoryResponse> getPublicCategories(String localeParam, String acceptLanguage) {
        String locale = localeResolverService.resolve(localeParam, acceptLanguage);

        return categoryRepository.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(category -> menuMapper.toPublicCategory(category, locale))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicMenuItemResponse> getPublicMenuItems(String localeParam, String acceptLanguage) {
        String locale = localeResolverService.resolve(localeParam, acceptLanguage);

        return menuItemRepository.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .filter(item -> item.getCategory().isActive())
                .map(item -> menuMapper.toPublicMenuItem(
                        item,
                        mediaAssetRepository.findAllByMenuItemOrderByDisplayOrderAsc(item),
                        locale
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public PublicMenuResponse getPublicMenu(String localeParam, String acceptLanguage) {
        String locale = localeResolverService.resolve(localeParam, acceptLanguage);

        List<Category> categories = categoryRepository.findAllByActiveTrueOrderByDisplayOrderAsc();
        List<MenuItem> items = menuItemRepository.findAllByActiveTrueOrderByDisplayOrderAsc();

        List<PublicMenuCategoryGroupResponse> groups = categories.stream()
                .map(category -> PublicMenuCategoryGroupResponse.builder()
                        .category(menuMapper.toPublicCategory(category, locale))
                        .items(items.stream()
                                .filter(item -> item.getCategory().getId().equals(category.getId()))
                                .sorted(Comparator.comparing(MenuItem::getDisplayOrder))
                                .map(item -> menuMapper.toPublicMenuItem(
                                        item,
                                        mediaAssetRepository.findAllByMenuItemOrderByDisplayOrderAsc(item),
                                        locale
                                ))
                                .toList())
                        .build())
                .toList();

        return PublicMenuResponse.builder()
                .categories(groups)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<AdminCategoryResponse> getAdminCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable)
                .map(menuMapper::toAdminCategory);
    }

    @Transactional
    public AdminCategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
            category.setNameEn(request.nameEn());
        category.setNameRo(request.nameRo());
        category.setMarkAsNew(request.markAsNew());
        category.setActive(request.active());
        category.setDisplayOrder(request.displayOrder());

        return menuMapper.toAdminCategory(categoryRepository.save(category));
    }

    @Transactional
    public AdminCategoryResponse updateCategory(UUID id, CategoryRequest request) {
        Category category = findCategory(id);

        category.setNameEn(request.nameEn());
        category.setNameRo(request.nameRo());
        category.setMarkAsNew(request.markAsNew());
        category.setActive(request.active());
        category.setDisplayOrder(request.displayOrder());

        return menuMapper.toAdminCategory(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = findCategory(id);
        category.setActive(false);
        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public Page<AdminMenuItemResponse> getAdminMenuItems(Pageable pageable) {
        return menuItemRepository.findAll(pageable)
                .map(item -> menuMapper.toAdminMenuItem(
                        item,
                        mediaAssetRepository.findAllByMenuItemOrderByDisplayOrderAsc(item)
                ));
    }

    @Transactional
    public AdminMenuItemResponse createMenuItem(MenuItemRequest request) {
        Category category = findCategory(request.categoryId());

        MenuItem item = new MenuItem();
        applyMenuItemRequest(item, request, category);

        MenuItem saved = menuItemRepository.save(item);

        return menuMapper.toAdminMenuItem(saved, List.of());
    }

    @Transactional
    public AdminMenuItemResponse updateMenuItem(UUID id, MenuItemRequest request) {
        MenuItem item = findMenuItem(id);
        Category category = findCategory(request.categoryId());

        applyMenuItemRequest(item, request, category);

        return menuMapper.toAdminMenuItem(
                item,
                mediaAssetRepository.findAllByMenuItemOrderByDisplayOrderAsc(item)
        );
    }

    @Transactional
    public void deleteMenuItem(UUID id) {
        MenuItem item = findMenuItem(id);
        item.setActive(false);
        menuItemRepository.delete(item);
    }

    @Transactional
    public AdminMediaAssetResponse uploadMenuItemImage(
            UUID menuItemId,
            MultipartFile file,
            String altEn,
            String altRo,
            Boolean primary
    ) {
        MenuItem menuItem = findMenuItem(menuItemId);
        CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadImage(file);

        boolean shouldBePrimary = Boolean.TRUE.equals(primary)
                || !mediaAssetRepository.existsByMenuItem(menuItem);

        if (shouldBePrimary) {
            mediaAssetRepository.unsetPrimaryForMenuItem(menuItemId);
        }

        MediaAsset asset = new MediaAsset();
        asset.setMenuItem(menuItem);
        asset.setPublicId(uploadedImage.publicId());
        asset.setSecureUrl(uploadedImage.secureUrl());
        asset.setResourceType(uploadedImage.resourceType());
        asset.setFormat(uploadedImage.format());
        asset.setWidth(uploadedImage.width());
        asset.setHeight(uploadedImage.height());
        asset.setBytes(uploadedImage.bytes());
        asset.setVersion(uploadedImage.version());
        asset.setFolder(uploadedImage.folder());
        asset.setAltEn(altEn);
        asset.setAltRo(altRo);
        asset.setPrimary(shouldBePrimary);
        asset.setDisplayOrder(mediaAssetRepository.findMaxDisplayOrderByMenuItemId(menuItemId) + 1);

        return menuMapper.toAdminMediaAsset(mediaAssetRepository.save(asset));
    }

    @Transactional
    public AdminMediaAssetResponse updateMenuItemImage(
            UUID menuItemId,
            UUID imageId,
            MediaAssetUpdateRequest request
    ) {
        MediaAsset asset = findMediaAsset(menuItemId, imageId);

        if (request.primary()) {
            mediaAssetRepository.unsetPrimaryForMenuItem(menuItemId);
        }

        asset.setAltEn(request.altEn());
        asset.setAltRo(request.altRo());
        asset.setPrimary(request.primary());
        asset.setDisplayOrder(request.displayOrder());

        return menuMapper.toAdminMediaAsset(asset);
    }

    @Transactional
    public AdminMediaAssetResponse setPrimaryImage(UUID menuItemId, UUID imageId) {
        MediaAsset asset = findMediaAsset(menuItemId, imageId);

        mediaAssetRepository.unsetPrimaryForMenuItem(menuItemId);
        asset.setPrimary(true);

        return menuMapper.toAdminMediaAsset(asset);
    }

    @Transactional
    public void reorderImages(UUID menuItemId, List<MediaAssetOrderRequest> request) {
        findMenuItem(menuItemId);

        for (MediaAssetOrderRequest orderRequest : request) {
            MediaAsset asset = findMediaAsset(menuItemId, orderRequest.imageId());
            asset.setDisplayOrder(orderRequest.displayOrder());
        }
    }

    @Transactional
    public void deleteMenuItemImage(UUID menuItemId, UUID imageId) {
        MediaAsset asset = findMediaAsset(menuItemId, imageId);

        cloudinaryService.deleteImage(asset.getPublicId());
        mediaAssetRepository.delete(asset);
    }

    private void applyMenuItemRequest(MenuItem item, MenuItemRequest request, Category category) {
        item.setCategory(category);
        item.setNameEn(request.nameEn());
        item.setNameRo(request.nameRo());
        item.setDescriptionEn(request.descriptionEn());
        item.setDescriptionRo(request.descriptionRo());
        item.setPrice(request.price());
        item.setWeightLabel(request.weightLabel());
        item.setMarkAsNew(request.markAsNew());
        item.setPopular(request.popular());
        item.setActive(request.active());
        item.setDisplayOrder(request.displayOrder());
    }

    private Category findCategory(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found "));
    }

    private MenuItem findMenuItem(UUID id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found "));
    }

    private MediaAsset findMediaAsset(UUID menuItemId, UUID imageId) {
        return mediaAssetRepository.findByIdAndMenuItemId(imageId, menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Media asset not found "));
    }
}