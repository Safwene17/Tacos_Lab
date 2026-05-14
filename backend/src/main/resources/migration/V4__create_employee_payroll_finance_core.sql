CREATE TABLE employees (
                           id UUID PRIMARY KEY,
                           first_name VARCHAR(120) NOT NULL,
                           last_name VARCHAR(120) NOT NULL,
                           phone_number VARCHAR(40) NOT NULL,
                           email VARCHAR(255),
                           salary_amount NUMERIC(10, 2) NOT NULL,
                           salary_currency VARCHAR(3) NOT NULL DEFAULT 'RON',
                           role VARCHAR(120),
                           employment_status VARCHAR(30) NOT NULL,
                           first_working_day DATE NOT NULL,
                           emergency_contact_name VARCHAR(180),
                           emergency_contact_phone VARCHAR(40),
                           notes TEXT,
                           created_at TIMESTAMPTZ NOT NULL,
                           updated_at TIMESTAMPTZ NOT NULL,
                           deleted_at TIMESTAMPTZ
);

CREATE TABLE transaction_categories (
                                        id UUID PRIMARY KEY,
                                        type VARCHAR(30) NOT NULL,
                                        name VARCHAR(150) NOT NULL,
                                        system_key VARCHAR(80) UNIQUE,
                                        active BOOLEAN NOT NULL DEFAULT TRUE,
                                        display_order INTEGER NOT NULL DEFAULT 0,
                                        created_at TIMESTAMPTZ NOT NULL,
                                        updated_at TIMESTAMPTZ NOT NULL,
                                        deleted_at TIMESTAMPTZ
);

CREATE TABLE payroll_records (
                                 id UUID PRIMARY KEY,
                                 employee_id UUID NOT NULL,
                                 amount NUMERIC(10, 2) NOT NULL,
                                 currency VARCHAR(3) NOT NULL DEFAULT 'RON',
                                 payment_date DATE NOT NULL,
                                 period_start DATE,
                                 period_end DATE,
                                 notes TEXT,
                                 created_at TIMESTAMPTZ NOT NULL,
                                 updated_at TIMESTAMPTZ NOT NULL,
                                 deleted_at TIMESTAMPTZ,

                                 CONSTRAINT fk_payroll_records_employee
                                     FOREIGN KEY (employee_id)
                                         REFERENCES employees (id)
);

CREATE TABLE transactions (
                              id UUID PRIMARY KEY,
                              type VARCHAR(30) NOT NULL,
                              amount NUMERIC(10, 2) NOT NULL,
                              currency VARCHAR(3) NOT NULL DEFAULT 'RON',
                              transaction_date DATE NOT NULL,
                              category_id UUID NOT NULL,
                              payment_method VARCHAR(40) NOT NULL,
                              notes TEXT,
                              employee_id UUID,
                              menu_item_id UUID,
                              payroll_record_id UUID,
                              created_at TIMESTAMPTZ NOT NULL,
                              updated_at TIMESTAMPTZ NOT NULL,
                              deleted_at TIMESTAMPTZ,

                              CONSTRAINT fk_transactions_category
                                  FOREIGN KEY (category_id)
                                      REFERENCES transaction_categories (id),

                              CONSTRAINT fk_transactions_employee
                                  FOREIGN KEY (employee_id)
                                      REFERENCES employees (id),

                              CONSTRAINT fk_transactions_menu_item
                                  FOREIGN KEY (menu_item_id)
                                      REFERENCES menu_items (id),

                              CONSTRAINT fk_transactions_payroll_record
                                  FOREIGN KEY (payroll_record_id)
                                      REFERENCES payroll_records (id)
);

CREATE INDEX idx_employees_deleted ON employees(deleted_at);
CREATE INDEX idx_employees_status ON employees(employment_status);

CREATE INDEX idx_payroll_records_employee_id ON payroll_records(employee_id);
CREATE INDEX idx_payroll_records_payment_date ON payroll_records(payment_date);
CREATE INDEX idx_payroll_records_deleted ON payroll_records(deleted_at);

CREATE INDEX idx_transaction_categories_type ON transaction_categories(type);
CREATE INDEX idx_transaction_categories_system_key ON transaction_categories(system_key);

CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_employee_id ON transactions(employee_id);
CREATE INDEX idx_transactions_payroll_record_id ON transactions(payroll_record_id);
CREATE INDEX idx_transactions_deleted ON transactions(deleted_at);

INSERT INTO transaction_categories (
    id, type, name, system_key, active, display_order, created_at, updated_at
) VALUES
      ('11111111-1111-1111-1111-111111111111', 'EXPENSE', 'Ingredients', 'INGREDIENTS', TRUE, 10, NOW(), NOW()),
      ('11111111-1111-1111-1111-111111111112', 'EXPENSE', 'Utilities', 'UTILITIES', TRUE, 20, NOW(), NOW()),
      ('11111111-1111-1111-1111-111111111113', 'EXPENSE', 'Rent', 'RENT', TRUE, 30, NOW(), NOW()),
      ('11111111-1111-1111-1111-111111111114', 'EXPENSE', 'Salaries', 'SALARIES', TRUE, 40, NOW(), NOW()),
      ('11111111-1111-1111-1111-111111111115', 'EXPENSE', 'Equipment', 'EQUIPMENT', TRUE, 50, NOW(), NOW()),
      ('11111111-1111-1111-1111-111111111116', 'EXPENSE', 'Packaging', 'PACKAGING', TRUE, 60, NOW(), NOW()),
      ('11111111-1111-1111-1111-111111111117', 'EXPENSE', 'Marketing', 'MARKETING', TRUE, 70, NOW(), NOW()),
      ('11111111-1111-1111-1111-111111111118', 'EXPENSE', 'Maintenance', 'MAINTENANCE', TRUE, 80, NOW(), NOW()),
      ('22222222-2222-2222-2222-222222222221', 'INCOME', 'In-store sales', 'IN_STORE_SALES', TRUE, 10, NOW(), NOW()),
      ('22222222-2222-2222-2222-222222222222', 'INCOME', 'Wolt sales', 'WOLT_SALES', TRUE, 20, NOW(), NOW()),
      ('22222222-2222-2222-2222-222222222223', 'INCOME', 'Other income', 'OTHER_INCOME', TRUE, 30, NOW(), NOW());