package com.example.backend.controller;

import com.example.backend.dto.request.ChangePasswordRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.response.AdminMeResponse;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/auth", produces = "application/json")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse
    ) {
        return ResponseEntity.status(200)
                .body(ApiResponse.ok("Login successful", authService.login(request, servletRequest, servletResponse)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(name = "${app.security.refresh-cookie.name}", required = false) String refreshToken,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Token refreshed successfully",
                        authService.refresh(refreshToken, servletRequest, servletResponse))
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "${app.security.refresh-cookie.name}", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        authService.logout(refreshToken, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AdminMeResponse>> me() {
        return ResponseEntity.ok(
                ApiResponse.ok("User profile retrieved successfully", authService.me())
        );
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletResponse response
    ) {
        authService.changePassword(request, response);
        return ResponseEntity.noContent().build();
    }
}