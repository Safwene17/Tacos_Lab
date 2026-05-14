package com.example.backend.service;

import com.example.backend.entity.AdminUser;
import com.example.backend.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        AdminUser admin = adminUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Admin account not found."));

        if (!admin.isEnabled()) {
            throw new DisabledException("Admin account is disabled.");
        }

        return User.builder()
                .username(admin.getEmail())
                .password(admin.getPasswordHash())
                .authorities(admin.getRole())
                .build();
    }
}