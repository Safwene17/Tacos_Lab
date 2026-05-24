package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(
        name = "refresh_tokens",
        indexes = {
                @Index(name = "idx_refresh_tokens_admin_user_id", columnList = "admin_user_id"),
                @Index(name = "idx_refresh_tokens_token_hash", columnList = "tokenHash", unique = true),
                @Index(name = "idx_refresh_tokens_expires_at", columnList = "expiresAt")
        }
)
public class RefreshToken extends BaseEntity {

    // DB-level cascade: deleting an AdminUser deletes all their RefreshTokens
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private AdminUser adminUser;

    @Column(nullable = false, unique = true)
    private String tokenHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column
    private Instant revokedAt;

    @Column
    private String createdByIp;

    @Column(length = 500)
    private String userAgent;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public boolean isActive() {
        return !isRevoked() && !isExpired();
    }
}