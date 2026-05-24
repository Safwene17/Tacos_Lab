package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PublicCategoryResponse;
import com.example.backend.dto.response.PublicMenuItemResponse;
import com.example.backend.dto.response.PublicMenuResponse;
import com.example.backend.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/public", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicMenuController {

    private final MenuService menuService;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<PublicCategoryResponse>>> categories(
            @RequestParam(required = false) String locale,
            @RequestHeader(name = "Accept-Language", required = false) String acceptLanguage
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Categories retrieved successfully",
                        menuService.getPublicCategories(locale, acceptLanguage))
        );
    }

    @GetMapping("/menu-items")
    public ResponseEntity<ApiResponse<List<PublicMenuItemResponse>>> menuItems(
            @RequestParam(required = false) String locale,
            @RequestHeader(name = "Accept-Language", required = false) String acceptLanguage
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Menu items retrieved successfully",
                        menuService.getPublicMenuItems(locale, acceptLanguage))
        );
    }

    @GetMapping("/menu")
    public ResponseEntity<ApiResponse<PublicMenuResponse>> menu(
            @RequestParam(required = false) String locale,
            @RequestHeader(name = "Accept-Language", required = false) String acceptLanguage
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Menu retrieved successfully",
                        menuService.getPublicMenu(locale, acceptLanguage))
        );
    }
}