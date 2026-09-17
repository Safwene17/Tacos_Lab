package com.example.backend.integration;

import com.example.backend.dto.request.EmployeeRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.enums.EmployeeStatus;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
        "app.security.refresh-cookie.name=le_tacos_refresh",
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
        "app.cloudinary.folder=le-tacos-test"
})
@DisplayName("Employee CRUD integration")
class EmployeeCrudIntegrationTest {

    private static final String ADMIN_EMAIL = "admin@test.local";
    private static final String ADMIN_PASSWORD = "Admin12345";

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("le_tacos_employee_crud_test")
            .withUsername("test")
            .withPassword("test");

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;

    EmployeeCrudIntegrationTest(MockMvc mockMvc, ObjectMapper objectMapper) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
    }

    @Nested
    @DisplayName("employee CRUD flow")
    class EmployeeCrudFlow {

        @Test
        @DisplayName("should create, read, update and delete employee through secured endpoints")
        void shouldCreateReadUpdateAndDeleteEmployeeThroughSecuredEndpoints() throws Exception {
            String accessToken = loginAndReturnAccessToken();

            UUID employeeId = createEmployeeAndReturnId(accessToken);

            mockMvc.perform(get("/api/admin/employees/{id}", employeeId)
                            .header(AUTHORIZATION, "Bearer " + accessToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(employeeId.toString()))
                    .andExpect(jsonPath("$.data.firstName").value("Alex"))
                    .andExpect(jsonPath("$.data.lastName").value("Popescu"));

            EmployeeRequest updateRequest = employeeRequest(
                    "Alexandru",
                    "Ionescu",
                    "+40745555555",
                    "alexandru.ionescu@example.com",
                    BigDecimal.valueOf(3900),
                    "Shift Manager"
            );

            mockMvc.perform(put("/api/admin/employees/{id}", employeeId)
                            .header(AUTHORIZATION, "Bearer " + accessToken)
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(employeeId.toString()))
                    .andExpect(jsonPath("$.data.firstName").value("Alexandru"))
                    .andExpect(jsonPath("$.data.lastName").value("Ionescu"))
                    .andExpect(jsonPath("$.data.role").value("Shift Manager"));

            mockMvc.perform(delete("/api/admin/employees/{id}", employeeId)
                            .header(AUTHORIZATION, "Bearer " + accessToken))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            mockMvc.perform(get("/api/admin/employees/{id}", employeeId)
                            .header(AUTHORIZATION, "Bearer " + accessToken))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.message").value("Employee not found "));
        }
    }

    private UUID createEmployeeAndReturnId(String accessToken) throws Exception {
        String response = mockMvc.perform(post("/api/admin/employees")
                        .header(AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employeeRequest(
                                "Alex",
                                "Popescu",
                                "+40740000000",
                                "alex.popescu@example.com",
                                BigDecimal.valueOf(3500),
                                "Cook"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        String employeeId = json.path("data").path("id").asText();

        assertThat(employeeId).isNotBlank();

        return UUID.fromString(employeeId);
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

    private EmployeeRequest employeeRequest(
            String firstName,
            String lastName,
            String phoneNumber,
            String email,
            BigDecimal salaryAmount,
            String role
    ) {
        return new EmployeeRequest(
                firstName,
                lastName,
                phoneNumber,
                email,
                salaryAmount,
                role,
                EmployeeStatus.ACTIVE,
                LocalDate.of(2025, 1, 1),
                "Maria Popescu",
                "+40741111111",
                "Integration test employee"
        );
    }
}