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
@RequestMapping("/api/admin")
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
                .body(ApiResponse.ok("Category created successfully",
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
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        menuService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted successfully", null));
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

    @PostMapping("/menu-items")
    public ResponseEntity<ApiResponse<AdminMenuItemResponse>> createMenuItem(
            @Valid @RequestBody MenuItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Menu item created successfully",
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
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable UUID id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Menu item deleted successfully", null));
    }

    @PostMapping(
            value = "/menu-items/{menuItemId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<AdminMediaAssetResponse>> uploadImage(
            @PathVariable UUID menuItemId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String altEn,
            @RequestParam(required = false) String altRo,
            @RequestParam(required = false, defaultValue = "false") Boolean primary
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Image uploaded successfully",
                        menuService.uploadMenuItemImage(menuItemId, file, altEn, altRo, primary)));
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
    public ResponseEntity<ApiResponse<Void>> reorderImages(
            @PathVariable UUID menuItemId,
            @Valid @RequestBody List<MediaAssetOrderRequest> request
    ) {
        menuService.reorderImages(menuItemId, request);
        return ResponseEntity.ok(ApiResponse.ok("Images reordered successfully", null));
    }

    @DeleteMapping("/menu-items/{menuItemId}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable UUID menuItemId,
            @PathVariable UUID imageId
    ) {
        menuService.deleteMenuItemImage(menuItemId, imageId);
        return ResponseEntity.ok(ApiResponse.ok("Image deleted successfully", null));
    }
}