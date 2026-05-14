package com.example.backend.service;

import com.example.backend.dto.request.ChangePasswordRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.response.AdminMeResponse;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.entity.AdminUser;
import com.example.backend.exception.BusinessException;
import com.example.backend.repository.AdminUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminUserRepository adminUserRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshCookieService refreshCookieService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse login(
            LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse
    ) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        AdminUser admin = findAdminByEmail(request.email());

        RefreshTokenService.IssuedRefreshToken refreshToken = refreshTokenService.issue(admin, servletRequest);
        refreshCookieService.addRefreshCookie(servletResponse, refreshToken.rawToken());

        return buildAuthResponse(admin);
    }

    @Transactional
    public AuthResponse refresh(
            String rawRefreshToken,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse
    ) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new BusinessException("Refresh token is missing.");
        }

        RefreshTokenService.RotatedRefreshToken rotatedToken =
                refreshTokenService.rotate(rawRefreshToken, servletRequest);

        refreshCookieService.addRefreshCookie(servletResponse, rotatedToken.rawToken());

        return buildAuthResponse(rotatedToken.adminUser());
    }

    @Transactional
    public void logout(String rawRefreshToken, HttpServletResponse response) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenService.revoke(rawRefreshToken);
        }

        refreshCookieService.clearRefreshCookie(response);
    }

    @Transactional(readOnly = true)
    public AdminMeResponse me() {
        AdminUser admin = currentAdmin();

        return AdminMeResponse.builder()
                .id(admin.getId())
                .email(admin.getEmail())
                .role(admin.getRole())
                .mustChangePassword(admin.isMustChangePassword())
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, HttpServletResponse response) {
        AdminUser admin = currentAdmin();

        if (!passwordEncoder.matches(request.currentPassword(), admin.getPasswordHash())) {
            throw new BusinessException("Current password is incorrect.");
        }

        admin.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        admin.setMustChangePassword(false);
        refreshTokenService.revokeAll(admin);
        refreshCookieService.clearRefreshCookie(response);
    }

    private AuthResponse buildAuthResponse(AdminUser admin) {
        String accessToken = jwtService.generateAccessToken(admin);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .expiresInSeconds(jwtService.accessTokenExpiresInSeconds())
                .expiresAt(jwtService.extractExpiration(accessToken))
                .mustChangePassword(admin.isMustChangePassword())
                .build();
    }

    private AdminUser currentAdmin() {
        String email = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        return findAdminByEmail(email);
    }

    private AdminUser findAdminByEmail(String email) {
        return adminUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException("Admin account not found."));
    }
}