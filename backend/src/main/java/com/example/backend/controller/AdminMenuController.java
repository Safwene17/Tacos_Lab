package com.example.backend.controller;

import com.example.backend.dto.request.*;
import com.example.backend.dto.response.*;
import com.example.backend.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/admin", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminMenuController {

    private final MenuService menuService;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<PageResponse<AdminCategoryResponse>>> categories(
            @PageableDefault(size = 20, sort = "displayOrder") Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Categories retrieved successfully",
                        PageResponse.from(menuService.getAdminCategories(pageable)))
        );
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<AdminCategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Category created successfully",
                        menuService.createCategory(request)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<AdminCategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Category updated successfully",
                        menuService.updateCategory(id, request))
        );
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        menuService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/menu-items")
    public ResponseEntity<ApiResponse<PageResponse<AdminMenuItemResponse>>> menuItems(
            @PageableDefault(size = 20, sort = "displayOrder") Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Menu items retrieved successfully",
                        PageResponse.from(menuService.getAdminMenuItems(pageable)))
        );
    }

    @GetMapping("/categories/{categoryId}/menu-items")
    public ResponseEntity<ApiResponse<PageResponse<AdminMenuItemResponse>>> getMenuItemsByCategoryId(
            @PathVariable UUID categoryId,
            @PageableDefault(size = 20, sort = "displayOrder") Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Menu items retrieved successfully",
                        PageResponse.from(menuService.getMenuItemsByCategoryId(categoryId, pageable)))
        );
    }

    @PostMapping("/menu-items")
    public ResponseEntity<ApiResponse<AdminMenuItemResponse>> createMenuItem(
            @Valid @RequestBody MenuItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Menu item created successfully",
                        menuService.createMenuItem(request)));
    }

    @PutMapping("/menu-items/{id}")
    public ResponseEntity<ApiResponse<AdminMenuItemResponse>> updateMenuItem(
            @PathVariable UUID id,
            @Valid @RequestBody MenuItemRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Menu item updated successfully",
                        menuService.updateMenuItem(id, request))
        );
    }

    @DeleteMapping("/menu-items/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable UUID id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(
            value = "/menu-items/{menuItemId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<AdminMediaAssetResponse>> uploadImage(
            @PathVariable UUID menuItemId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String alt,
            @RequestParam(required = false, defaultValue = "false") Boolean primary
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Image uploaded successfully",
                        menuService.uploadMenuItemImage(menuItemId, file, alt, primary)));
    }

    @PutMapping("/menu-items/{menuItemId}/images/{imageId}")
    public ResponseEntity<ApiResponse<AdminMediaAssetResponse>> updateImage(
            @PathVariable UUID menuItemId,
            @PathVariable UUID imageId,
            @Valid @RequestBody MediaAssetUpdateRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Image updated successfully",
                        menuService.updateMenuItemImage(menuItemId, imageId, request))
        );
    }

    @PatchMapping("/menu-items/{menuItemId}/images/{imageId}/primary")
    public ResponseEntity<ApiResponse<AdminMediaAssetResponse>> setPrimaryImage(
            @PathVariable UUID menuItemId,
            @PathVariable UUID imageId
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Primary image set successfully",
                        menuService.setPrimaryImage(menuItemId, imageId))
        );
    }

    @PatchMapping("/menu-items/{menuItemId}/images/reorder")
    public ResponseEntity<Void> reorderImages(
            @PathVariable UUID menuItemId,
            @Valid @RequestBody List<MediaAssetOrderRequest> request
    ) {
        menuService.reorderImages(menuItemId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/menu-items/{menuItemId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable UUID menuItemId,
            @PathVariable UUID imageId
    ) {
        menuService.deleteMenuItemImage(menuItemId, imageId);
        return ResponseEntity.noContent().build();
    }
}