CREATE TABLE admin_users (
                             id UUID PRIMARY KEY,
                             email VARCHAR(255) NOT NULL UNIQUE,
                             password_hash VARCHAR(255) NOT NULL,
                             role VARCHAR(50) NOT NULL,
                             enabled BOOLEAN NOT NULL DEFAULT TRUE,
                             must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
                             last_login_at TIMESTAMPTZ,
                             created_at TIMESTAMPTZ NOT NULL,
                             updated_at TIMESTAMPTZ NOT NULL,
                             deleted_at TIMESTAMPTZ
);

CREATE TABLE refresh_tokens (
                                id UUID PRIMARY KEY,
                                admin_user_id UUID NOT NULL,
                                token_hash VARCHAR(255) NOT NULL UNIQUE,
                                expires_at TIMESTAMPTZ NOT NULL,
                                revoked_at TIMESTAMPTZ,
                                created_by_ip VARCHAR(100),
                                user_agent VARCHAR(500),
                                created_at TIMESTAMPTZ NOT NULL,
                                updated_at TIMESTAMPTZ NOT NULL,
                                deleted_at TIMESTAMPTZ,

                                CONSTRAINT fk_refresh_tokens_admin_user
                                    FOREIGN KEY (admin_user_id)
                                        REFERENCES admin_users (id)
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_admin_user_id ON refresh_tokens(admin_user_id);