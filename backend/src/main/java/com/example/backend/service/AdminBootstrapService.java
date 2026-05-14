package com.example.backend.service;

import com.example.backend.config.AppProperties;
import com.example.backend.constant.AppConstants;
import com.example.backend.entity.AdminUser;
import com.example.backend.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminBootstrapService implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    @Override
    public void run(String... args) {
        if (adminUserRepository.existsByEmailIgnoreCase(appProperties.admin().email())) {
            return;
        }

        String email = appProperties.admin().email();
        String initialPassword = appProperties.admin().initialPassword();

        if (!StringUtils.hasText(email) || !StringUtils.hasText(initialPassword)) {
            throw new IllegalStateException(
                    "No admin user exists. Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD environment variables."
            );
        }

        AdminUser admin = new AdminUser();
        admin.setEmail(email.toLowerCase().trim());
        admin.setPasswordHash(passwordEncoder.encode(initialPassword));
        admin.setRole(AppConstants.ADMIN_ROLE);
        admin.setEnabled(true);
        admin.setMustChangePassword(true);

        adminUserRepository.save(admin);
    }
}