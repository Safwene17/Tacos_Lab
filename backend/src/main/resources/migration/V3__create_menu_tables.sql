CREATE TABLE categories (
                            id UUID PRIMARY KEY,
                            name VARCHAR(150) NOT NULL,
                            mark_as_new BOOLEAN NOT NULL DEFAULT FALSE,
                            active BOOLEAN NOT NULL DEFAULT TRUE,
                            display_order INTEGER NOT NULL DEFAULT 0,
                            created_at TIMESTAMPTZ NOT NULL,
                            updated_at TIMESTAMPTZ NOT NULL,
                            deleted_at TIMESTAMPTZ
);

CREATE TABLE menu_items (
                            id UUID PRIMARY KEY,
                            category_id UUID NOT NULL,
                            name VARCHAR(180) NOT NULL,
                            description TEXT,
                            ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
                            price NUMERIC(10, 2) NOT NULL,
                            currency VARCHAR(3) NOT NULL DEFAULT 'RON',
                            weight_label VARCHAR(50),
                            mark_as_new BOOLEAN NOT NULL DEFAULT FALSE,
                            popular BOOLEAN NOT NULL DEFAULT FALSE,
                            active BOOLEAN NOT NULL DEFAULT TRUE,
                            display_order INTEGER NOT NULL DEFAULT 0,
                            created_at TIMESTAMPTZ NOT NULL,
                            updated_at TIMESTAMPTZ NOT NULL,
                            deleted_at TIMESTAMPTZ,

                            CONSTRAINT fk_menu_items_category
                                FOREIGN KEY (category_id)
                                    REFERENCES categories (id)
);

CREATE TABLE media_assets (
                              id UUID PRIMARY KEY,
                              menu_item_id UUID NOT NULL,
                              public_id VARCHAR(255) NOT NULL UNIQUE,
                              secure_url TEXT NOT NULL,
                              resource_type VARCHAR(50) NOT NULL,
                              format VARCHAR(30),
                              width INTEGER,
                              height INTEGER,
                              bytes BIGINT,
                              version VARCHAR(80),
                              folder VARCHAR(255),
                              alt VARCHAR(255),
                              display_order INTEGER NOT NULL DEFAULT 0,
                              is_primary BOOLEAN NOT NULL DEFAULT FALSE,
                              created_at TIMESTAMPTZ NOT NULL,
                              updated_at TIMESTAMPTZ NOT NULL,
                              deleted_at TIMESTAMPTZ,

                              CONSTRAINT fk_media_assets_menu_item
                                  FOREIGN KEY (menu_item_id)
                                      REFERENCES menu_items (id)
);

CREATE INDEX idx_categories_active_deleted ON categories(active, deleted_at);
CREATE INDEX idx_categories_display_order ON categories(display_order);

CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_active_deleted ON menu_items(active, deleted_at);
CREATE INDEX idx_menu_items_display_order ON menu_items(display_order);

CREATE INDEX idx_media_assets_menu_item_id ON media_assets(menu_item_id);
CREATE INDEX idx_media_assets_primary ON media_assets(is_primary);
CREATE INDEX idx_media_assets_display_order ON media_assets(display_order);