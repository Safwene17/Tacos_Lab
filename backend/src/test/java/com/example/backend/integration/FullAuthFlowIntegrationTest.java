package com.example.backend.integration;

import com.example.backend.dto.request.LoginRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "spring.profiles.active=test",
        "server.port=0",
        "app.security.jwt.secret=test-secret-test-secret-test-secret-test-secret",
        "app.security.jwt.access-token-minutes=20",
        "app.security.jwt.refresh-token-days=7",
        "app.security.jwt.issuer=tacos-lab-api-test",
        "app.security.refresh-cookie.name=tacos_lab_refresh",
        "app.security.refresh-cookie.path=/api/auth",
        "app.security.refresh-cookie.http-only=true",
        "app.security.refresh-cookie.secure=false",
        "app.security.refresh-cookie.same-site=Lax",
        "app.cors.allowed-origins=http://localhost:4200",
        "app.cors.allowed-methods=GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "app.cors.allowed-headers=Authorization,Content-Type,Accept",
        "app.cors.allow-credentials=true",
        "app.admin.email=admin@test.local",
        "app.admin.initial-password=Admin12345",
        "app.cloudinary.cloud-name=test-cloud",
        "app.cloudinary.api-key=test-key",
        "app.cloudinary.api-secret=test-secret",
        "app.cloudinary.folder=tacos-lab-test"
})
@DisplayName("Full auth flow integration")
class FullAuthFlowIntegrationTest {

    private static final String ADMIN_EMAIL = "admin@test.local";
    private static final String ADMIN_PASSWORD = "Admin12345";
    private static final String INVALID_TOKEN = "invalid.jwt.token";

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("tacos_lab_full_auth_flow_test")
            .withUsername("test")
            .withPassword("test");

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;

    FullAuthFlowIntegrationTest(MockMvc mockMvc, ObjectMapper objectMapper) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
    }

    @Nested
    @DisplayName("authenticated flow")
    class AuthenticatedFlow {

        @Test
        @DisplayName("should login and access current admin profile with returned access token")
        void shouldLoginAndAccessCurrentAdminProfileWithReturnedAccessToken() throws Exception {
            String accessToken = loginAndReturnAccessToken();

            mockMvc.perform(get("/api/auth/me")
                            .header(AUTHORIZATION, "Bearer " + accessToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.email").value(ADMIN_EMAIL))
                    .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
        }
    }

    @Nested
    @DisplayName("unauthorized flow")
    class UnauthorizedFlow {

        @Test
        @DisplayName("should reject admin endpoint when token is missing")
        void shouldRejectAdminEndpointWhenTokenIsMissing() throws Exception {
            mockMvc.perform(get("/api/admin/employees"))
                    .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));
        }

        @Test
        @DisplayName("should reject admin endpoint when token is invalid")
        void shouldRejectAdminEndpointWhenTokenIsInvalid() throws Exception {
            mockMvc.perform(get("/api/admin/employees")
                            .header(AUTHORIZATION, "Bearer " + INVALID_TOKEN))
                    .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403, 500));
        }
    }

    private String loginAndReturnAccessToken() throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(ADMIN_EMAIL, ADMIN_PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        String accessToken = json.path("data").path("accessToken").asText();

        assertThat(accessToken).isNotBlank();

        return accessToken;
    }
}