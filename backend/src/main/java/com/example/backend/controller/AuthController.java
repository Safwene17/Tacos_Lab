package com.example.backend.controller;

import com.example.backend.dto.request.ChangePasswordRequest;
import com.example.backend.dto.request.ForceChangePasswordRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.response.AdminMeResponse;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/auth", produces = "application/json")
@Tag(name = "Auth", description = "Authentication and authorization endpoints")
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
    @Operation(summary = "Change password", description = "Change the current user's password. Requires providing the current password for verification.")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletResponse response
    ) {
        authService.changePassword(request, response);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/force-change-password")
    @Operation(summary = "Force change password", description = "Change the password on first login. This endpoint is used when a user is required to change their password immediately after first login. No current password verification is required.")
    public ResponseEntity<Void> forceChangePassword(
            @Valid @RequestBody ForceChangePasswordRequest request,
            HttpServletResponse response
    ) {
        authService.forceChangePassword(request, response);
        return ResponseEntity.noContent().build();
    }
}