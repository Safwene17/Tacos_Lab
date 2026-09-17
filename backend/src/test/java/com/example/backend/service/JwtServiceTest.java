package com.example.backend.service;

import com.example.backend.config.AppProperties;
import com.example.backend.entity.AdminUser;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.exception.TokenExpiredException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtService")
class JwtServiceTest {

    private static final String SECRET = "test-secret-test-secret-test-secret-test-secret";
    private static final String SHORT_SECRET = "short";
    private static final String ISSUER = "tacos-lab-test";
    private static final String ADMIN_EMAIL = "admin@test.local";
    private static final String ADMIN_ROLE = "ROLE_ADMIN";

    @Nested
    @DisplayName("Token generation")
    class TokenGeneration {

        @Test
        @DisplayName("should generate valid access token when admin is valid")
        void shouldGenerateValidAccessTokenWhenAdminIsValid() {
            JwtService jwtService = new JwtService(appProperties(SECRET, 20));
            AdminUser admin = adminUser();

            String token = jwtService.generateAccessToken(admin);

            assertThat(token).isNotBlank();
            assertThat(jwtService.extractSubject(token)).isEqualTo(ADMIN_EMAIL);
            assertThat(jwtService.extractExpiration(token)).isAfter(Instant.now());
        }

        @Test
        @DisplayName("should expose configured expiration duration in seconds")
        void shouldExposeConfiguredExpirationDurationInSeconds() {
            JwtService jwtService = new JwtService(appProperties(SECRET, 20));

            assertThat(jwtService.accessTokenExpiresInSeconds()).isEqualTo(1200L);
        }
    }

    @Nested
    @DisplayName("Token validation")
    class TokenValidation {

        @Test
        @DisplayName("should return true when token is valid and email matches")
        void shouldReturnTrueWhenTokenIsValidAndEmailMatches() {
            JwtService jwtService = new JwtService(appProperties(SECRET, 20));
            String token = jwtService.generateAccessToken(adminUser());

            boolean valid = jwtService.isValid(token, ADMIN_EMAIL);

            assertThat(valid).isTrue();
        }

        @Test
        @DisplayName("should return true when token email matches ignoring case")
        void shouldReturnTrueWhenTokenEmailMatchesIgnoringCase() {
            JwtService jwtService = new JwtService(appProperties(SECRET, 20));
            String token = jwtService.generateAccessToken(adminUser());

            boolean valid = jwtService.isValid(token, "ADMIN@TEST.LOCAL");

            assertThat(valid).isTrue();
        }

        @Test
        @DisplayName("should return false when token email does not match")
        void shouldReturnFalseWhenTokenEmailDoesNotMatch() {
            JwtService jwtService = new JwtService(appProperties(SECRET, 20));
            String token = jwtService.generateAccessToken(adminUser());

            boolean valid = jwtService.isValid(token, "other@test.local");

            assertThat(valid).isFalse();
        }

        @Test
        @DisplayName("should return false when token is expired")
        void shouldReturnFalseWhenTokenIsExpired() {
            JwtService jwtService = new JwtService(appProperties(SECRET, -1));
            String token = jwtService.generateAccessToken(adminUser());

            boolean valid = jwtService.isValid(token, ADMIN_EMAIL);

            assertThat(valid).isFalse();
        }

        @Test
        @DisplayName("should return false when token is tampered")
        void shouldReturnFalseWhenTokenIsTampered() {
            JwtService jwtService = new JwtService(appProperties(SECRET, 20));
            String token = jwtService.generateAccessToken(adminUser());

            boolean valid = jwtService.isValid(token + "tampered", ADMIN_EMAIL);

            assertThat(valid).isFalse();
        }
    }

    @Nested
    @DisplayName("Token extraction failures")
    class TokenExtractionFailures {

        @Test
        @DisplayName("should throw TokenExpiredException when token is expired")
        void shouldThrowTokenExpiredExceptionWhenTokenIsExpired() {
            JwtService jwtService = new JwtService(appProperties(SECRET, -1));
            String token = jwtService.generateAccessToken(adminUser());

            assertThatThrownBy(() -> jwtService.extractSubject(token))
                    .isInstanceOf(TokenExpiredException.class)
                    .hasMessage("Access token has expired");
        }

        @Test
        @DisplayName("should throw InvalidTokenException when token is malformed")
        void shouldThrowInvalidTokenExceptionWhenTokenIsMalformed() {
            JwtService jwtService = new JwtService(appProperties(SECRET, 20));

            assertThatThrownBy(() -> jwtService.extractSubject("malformed-token"))
                    .isInstanceOf(InvalidTokenException.class)
                    .hasMessage("Access token is invalid or tampered");
        }

        @Test
        @DisplayName("should throw InvalidTokenException when token is signed with different secret")
        void shouldThrowInvalidTokenExceptionWhenTokenIsSignedWithDifferentSecret() {
            JwtService issuerService = new JwtService(appProperties(SECRET, 20));
            JwtService verifierService = new JwtService(appProperties("another-secret-another-secret-another-secret", 20));

            String token = issuerService.generateAccessToken(adminUser());

            assertThatThrownBy(() -> verifierService.extractSubject(token))
                    .isInstanceOf(InvalidTokenException.class)
                    .hasMessage("Access token is invalid or tampered");
        }
    }

    @Nested
    @DisplayName("Construction")
    class Construction {

        @Test
        @DisplayName("should throw IllegalStateException when secret is shorter than 32 bytes")
        void shouldThrowIllegalStateExceptionWhenSecretIsShorterThan32Bytes() {
            assertThatThrownBy(() -> new JwtService(appProperties(SHORT_SECRET, 20)))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("JWT secret must be at least 32 bytes.");
        }
    }

    private AdminUser adminUser() {
        AdminUser admin = new AdminUser();
        admin.setEmail(ADMIN_EMAIL);
        admin.setRole(ADMIN_ROLE);
        admin.setEnabled(true);
        admin.setMustChangePassword(false);
        return admin;
    }

    private AppProperties appProperties(String secret, long accessTokenMinutes) {
        return new AppProperties(
                new AppProperties.Security(
                        new AppProperties.Jwt(secret, accessTokenMinutes, 7, ISSUER),
                        new AppProperties.RefreshCookie("le_tacos_refresh", "/api/auth", true, false, "Lax")
                ),
                new AppProperties.Cors(
                        List.of("http://localhost:4200"),
                        List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"),
                        List.of("Authorization", "Content-Type", "Accept"),
                        true
                ),
                new AppProperties.Admin("admin@test.local", "Admin12345"),
                new AppProperties.Cloudinary("test-cloud", "test-key", "test-secret", "le-tacos-test")
        );
    }
}