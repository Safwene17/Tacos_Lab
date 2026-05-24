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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@DisplayName("AuthService")
class AuthServiceTest {

    private static final UUID ADMIN_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final String ADMIN_EMAIL = "admin@test.local";
    private static final String RAW_PASSWORD = "Admin12345";
    private static final String NEW_PASSWORD = "NewAdmin12345";
    private static final String ENCODED_PASSWORD = "$2a$10$password";
    private static final String NEW_ENCODED_PASSWORD = "$2a$10$new-password";
    private static final String ACCESS_TOKEN = "access-token";
    private static final String RAW_REFRESH_TOKEN = "refresh-token";
    private static final Instant ACCESS_EXPIRES_AT = Instant.parse("2030-01-01T00:00:00Z");

    private final AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
    private final AdminUserRepository adminUserRepository = mock(AdminUserRepository.class);
    private final JwtService jwtService = mock(JwtService.class);
    private final RefreshTokenService refreshTokenService = mock(RefreshTokenService.class);
    private final RefreshCookieService refreshCookieService = mock(RefreshCookieService.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final HttpServletRequest servletRequest = mock(HttpServletRequest.class);
    private final HttpServletResponse servletResponse = mock(HttpServletResponse.class);

    private final AuthService authService = new AuthService(
            authenticationManager,
            adminUserRepository,
            jwtService,
            refreshTokenService,
            refreshCookieService,
            passwordEncoder
    );

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("should authenticate, issue refresh cookie and return auth response when credentials are valid")
        void shouldAuthenticateIssueRefreshCookieAndReturnAuthResponseWhenCredentialsAreValid() {
            AdminUser admin = adminUser();
            LoginRequest request = new LoginRequest(ADMIN_EMAIL, RAW_PASSWORD);
            RefreshTokenService.IssuedRefreshToken issuedRefreshToken =
                    new RefreshTokenService.IssuedRefreshToken(RAW_REFRESH_TOKEN, Instant.now().plusSeconds(3600));

            when(adminUserRepository.findByEmailIgnoreCase(ADMIN_EMAIL)).thenReturn(Optional.of(admin));
            when(refreshTokenService.issue(admin, servletRequest)).thenReturn(issuedRefreshToken);
            when(jwtService.generateAccessToken(admin)).thenReturn(ACCESS_TOKEN);
            when(jwtService.accessTokenExpiresInSeconds()).thenReturn(1200L);
            when(jwtService.extractExpiration(ACCESS_TOKEN)).thenReturn(ACCESS_EXPIRES_AT);

            AuthResponse response = authService.login(request, servletRequest, servletResponse);

            ArgumentCaptor<UsernamePasswordAuthenticationToken> authCaptor =
                    ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);

            verify(authenticationManager).authenticate(authCaptor.capture());
            assertThat(authCaptor.getValue().getPrincipal()).isEqualTo(ADMIN_EMAIL);
            assertThat(authCaptor.getValue().getCredentials()).isEqualTo(RAW_PASSWORD);

            verify(refreshTokenService).issue(admin, servletRequest);
            verify(refreshCookieService).addRefreshCookie(servletResponse, RAW_REFRESH_TOKEN);

            assertThat(response.accessToken()).isEqualTo(ACCESS_TOKEN);
            assertThat(response.expiresInSeconds()).isEqualTo(1200L);
            assertThat(response.expiresAt()).isEqualTo(ACCESS_EXPIRES_AT);
            assertThat(response.mustChangePassword()).isFalse();
        }

        @Test
        @DisplayName("should throw BusinessException when admin is not found after authentication")
        void shouldThrowBusinessExceptionWhenAdminIsNotFoundAfterAuthentication() {
            LoginRequest request = new LoginRequest(ADMIN_EMAIL, RAW_PASSWORD);

            when(adminUserRepository.findByEmailIgnoreCase(ADMIN_EMAIL)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request, servletRequest, servletResponse))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Admin account not found.");

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verifyNoInteractions(refreshTokenService, refreshCookieService, jwtService);
        }
    }

    @Nested
    @DisplayName("refresh")
    class Refresh {

        @Test
        @DisplayName("should throw BusinessException when raw refresh token is null")
        void shouldThrowBusinessExceptionWhenRawRefreshTokenIsNull() {
            assertThatThrownBy(() -> authService.refresh(null, servletRequest, servletResponse))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Refresh token is missing.");

            verifyNoInteractions(refreshTokenService, refreshCookieService, jwtService);
        }

        @Test
        @DisplayName("should throw BusinessException when raw refresh token is blank")
        void shouldThrowBusinessExceptionWhenRawRefreshTokenIsBlank() {
            assertThatThrownBy(() -> authService.refresh("   ", servletRequest, servletResponse))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Refresh token is missing.");

            verifyNoInteractions(refreshTokenService, refreshCookieService, jwtService);
        }

        @Test
        @DisplayName("should rotate refresh token and return new auth response when refresh token is valid")
        void shouldRotateRefreshTokenAndReturnNewAuthResponseWhenRefreshTokenIsValid() {
            AdminUser admin = adminUser();
            RefreshTokenService.RotatedRefreshToken rotatedRefreshToken =
                    new RefreshTokenService.RotatedRefreshToken(admin, RAW_REFRESH_TOKEN, Instant.now().plusSeconds(3600));

            when(refreshTokenService.rotate(RAW_REFRESH_TOKEN, servletRequest)).thenReturn(rotatedRefreshToken);
            when(jwtService.generateAccessToken(admin)).thenReturn(ACCESS_TOKEN);
            when(jwtService.accessTokenExpiresInSeconds()).thenReturn(1200L);
            when(jwtService.extractExpiration(ACCESS_TOKEN)).thenReturn(ACCESS_EXPIRES_AT);

            AuthResponse response = authService.refresh(RAW_REFRESH_TOKEN, servletRequest, servletResponse);

            verify(refreshTokenService).rotate(RAW_REFRESH_TOKEN, servletRequest);
            verify(refreshCookieService).addRefreshCookie(servletResponse, RAW_REFRESH_TOKEN);

            assertThat(response.accessToken()).isEqualTo(ACCESS_TOKEN);
            assertThat(response.expiresAt()).isEqualTo(ACCESS_EXPIRES_AT);
        }
    }

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("should revoke refresh token and clear cookie when refresh token is present")
        void shouldRevokeRefreshTokenAndClearCookieWhenRefreshTokenIsPresent() {
            authService.logout(RAW_REFRESH_TOKEN, servletResponse);

            verify(refreshTokenService).revoke(RAW_REFRESH_TOKEN);
            verify(refreshCookieService).clearRefreshCookie(servletResponse);
        }

        @Test
        @DisplayName("should only clear cookie when refresh token is blank")
        void shouldOnlyClearCookieWhenRefreshTokenIsBlank() {
            authService.logout(" ", servletResponse);

            verify(refreshTokenService, never()).revoke(any());
            verify(refreshCookieService).clearRefreshCookie(servletResponse);
        }

        @Test
        @DisplayName("should only clear cookie when refresh token is null")
        void shouldOnlyClearCookieWhenRefreshTokenIsNull() {
            authService.logout(null, servletResponse);

            verify(refreshTokenService, never()).revoke(any());
            verify(refreshCookieService).clearRefreshCookie(servletResponse);
        }
    }

    @Nested
    @DisplayName("me")
    class Me {

        @Test
        @DisplayName("should return current admin profile when authenticated")
        void shouldReturnCurrentAdminProfileWhenAuthenticated() {
            AdminUser admin = adminUser();
            authenticateAs(ADMIN_EMAIL);

            when(adminUserRepository.findByEmailIgnoreCase(ADMIN_EMAIL)).thenReturn(Optional.of(admin));

            AdminMeResponse response = authService.me();

            assertThat(response.id()).isEqualTo(ADMIN_ID);
            assertThat(response.email()).isEqualTo(ADMIN_EMAIL);
            assertThat(response.role()).isEqualTo("ROLE_ADMIN");
            assertThat(response.mustChangePassword()).isFalse();
        }
    }

    @Nested
    @DisplayName("changePassword")
    class ChangePassword {

        @Test
        @DisplayName("should throw BusinessException when current password is wrong")
        void shouldThrowBusinessExceptionWhenCurrentPasswordIsWrong() {
            AdminUser admin = adminUser();
            authenticateAs(ADMIN_EMAIL);
            ChangePasswordRequest request = new ChangePasswordRequest(RAW_PASSWORD, NEW_PASSWORD);

            when(adminUserRepository.findByEmailIgnoreCase(ADMIN_EMAIL)).thenReturn(Optional.of(admin));
            when(passwordEncoder.matches(RAW_PASSWORD, ENCODED_PASSWORD)).thenReturn(false);

            assertThatThrownBy(() -> authService.changePassword(request, servletResponse))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Current password is incorrect.");

            verify(refreshTokenService, never()).revokeAll(any());
            verify(refreshCookieService, never()).clearRefreshCookie(any());
        }

        @Test
        @DisplayName("should update password, revoke tokens and clear cookie when current password is correct")
        void shouldUpdatePasswordRevokeTokensAndClearCookieWhenCurrentPasswordIsCorrect() {
            AdminUser admin = adminUser();
            authenticateAs(ADMIN_EMAIL);
            ChangePasswordRequest request = new ChangePasswordRequest(RAW_PASSWORD, NEW_PASSWORD);

            when(adminUserRepository.findByEmailIgnoreCase(ADMIN_EMAIL)).thenReturn(Optional.of(admin));
            when(passwordEncoder.matches(RAW_PASSWORD, ENCODED_PASSWORD)).thenReturn(true);
            when(passwordEncoder.encode(NEW_PASSWORD)).thenReturn(NEW_ENCODED_PASSWORD);

            authService.changePassword(request, servletResponse);

            assertThat(admin.getPasswordHash()).isEqualTo(NEW_ENCODED_PASSWORD);
            assertThat(admin.isMustChangePassword()).isFalse();

            verify(refreshTokenService).revokeAll(admin);
            verify(refreshCookieService).clearRefreshCookie(servletResponse);
        }
    }

    private AdminUser adminUser() {
        AdminUser admin = new AdminUser();
        admin.setId(ADMIN_ID);
        admin.setEmail(ADMIN_EMAIL);
        admin.setPasswordHash(ENCODED_PASSWORD);
        admin.setRole("ROLE_ADMIN");
        admin.setEnabled(true);
        admin.setMustChangePassword(false);
        return admin;
    }

    private void authenticateAs(String email) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(email);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}