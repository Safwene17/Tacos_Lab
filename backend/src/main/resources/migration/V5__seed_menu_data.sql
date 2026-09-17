-- Seed data for Tacos Lab menu - inserts realistic menu items and categories

-- Categories
INSERT INTO categories (id, name, mark_as_new, active, display_order, created_at, updated_at)
VALUES
    -- Tacos
    ('550e8400-e29b-41d4-a716-446655440001', 'Tacos', FALSE, TRUE, 1, NOW(), NOW()),
    -- Burritos
    ('550e8400-e29b-41d4-a716-446655440002', 'Burritos', FALSE, TRUE, 2, NOW(), NOW()),
    -- Quesadillas
    ('550e8400-e29b-41d4-a716-446655440003', 'Quesadillas', FALSE, TRUE, 3, NOW(), NOW()),
    -- Sides
    ('550e8400-e29b-41d4-a716-446655440004', 'Sides', FALSE, TRUE, 4, NOW(), NOW()),
    -- Drinks
    ('550e8400-e29b-41d4-a716-446655440005', 'Drinks', FALSE, TRUE, 5, NOW(), NOW()),
    -- Desserts
    ('550e8400-e29b-41d4-a716-446655440006', 'Desserts', FALSE, TRUE, 6, NOW(), NOW());

-- Menu Items - Tacos
INSERT INTO menu_items (id, category_id, name, description, ingredients, price, currency, weight_label, mark_as_new, popular, active, display_order, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'Carne Asada', 'Flame-grilled tender beef with cilantro, onions, and lime', '["Grilled Beef", "Cilantro", "Onions", "Lime", "Corn Tortillas"]', 15.99, 'RON', '200g', FALSE, TRUE, TRUE, 1, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'Al Pastor', 'Marinated pork with pineapple, cilantro, and onions', '["Marinated Pork", "Pineapple", "Cilantro", "Onions", "Corn Tortillas"]', 14.99, 'RON', '180g', TRUE, TRUE, TRUE, 2, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'Pollo Asado', 'Seasoned grilled chicken breast with fresh garnishes', '["Grilled Chicken", "Cilantro", "Onions", "Jalapeños", "Corn Tortillas"]', 13.99, 'RON', '170g', FALSE, FALSE, TRUE, 3, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440001', 'Carnitas', 'Slow-cooked shredded pork with crispy edges', '["Slow-cooked Pork", "Cilantro", "Onions", "Corn Tortillas"]', 14.99, 'RON', '190g', FALSE, TRUE, TRUE, 4, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440001', 'Pescado', 'Grilled fish with cabbage slaw and chipotle crema', '["Grilled Fish", "Cabbage", "Chipotle Crema", "Lime", "Corn Tortillas"]', 16.99, 'RON', '160g', TRUE, FALSE, TRUE, 5, NOW(), NOW());

-- Menu Items - Burritos
INSERT INTO menu_items (id, category_id, name, description, ingredients, price, currency, weight_label, mark_as_new, popular, active, display_order, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440002', 'Burrito Carne Asada', 'Beef, rice, beans, cheese, guacamole, and salsa in a large tortilla', '["Grilled Beef", "Rice", "Black Beans", "Cheese", "Guacamole", "Salsa", "Flour Tortilla"]', 18.99, 'RON', '350g', FALSE, TRUE, TRUE, 1, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'Burrito Pollo', 'Grilled chicken with rice, beans, and fresh vegetables', '["Grilled Chicken", "Rice", "Black Beans", "Bell Peppers", "Onions", "Cheese", "Flour Tortilla"]', 17.99, 'RON', '330g', FALSE, FALSE, TRUE, 2, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440002', 'Burrito Vegano', 'Seasoned black beans, rice, guacamole, and vegetable medley', '["Black Beans", "Rice", "Guacamole", "Bell Peppers", "Zucchini", "Mushrooms", "Flour Tortilla"]', 14.99, 'RON', '300g', TRUE, FALSE, TRUE, 3, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440002', 'Burrito Carnitas', 'Slow-cooked pork, rice, beans, and caramelized onions', '["Slow-cooked Pork", "Rice", "Black Beans", "Caramelized Onions", "Cheese", "Flour Tortilla"]', 18.99, 'RON', '340g', FALSE, TRUE, TRUE, 4, NOW(), NOW());

-- Menu Items - Quesadillas
INSERT INTO menu_items (id, category_id, name, description, ingredients, price, currency, weight_label, mark_as_new, popular, active, display_order, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440003', 'Quesadilla Carne', 'Grilled cheese tortilla with beef, peppers, and onions', '["Grilled Beef", "Oaxaca Cheese", "Bell Peppers", "Onions", "Flour Tortilla"]', 16.99, 'RON', '280g', FALSE, TRUE, TRUE, 1, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440003', 'Quesadilla Pollo', 'Chicken with melted cheese and roasted vegetables', '["Grilled Chicken", "Oaxaca Cheese", "Roasted Vegetables", "Flour Tortilla"]', 15.99, 'RON', '270g', FALSE, FALSE, TRUE, 2, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440003', 'Quesadilla Hongos', 'Mushrooms, cheese, and caramelized onions - vegetarian favorite', '["Mushrooms", "Oaxaca Cheese", "Caramelized Onions", "Epazote", "Flour Tortilla"]', 13.99, 'RON', '250g', TRUE, FALSE, TRUE, 3, NOW(), NOW());

-- Menu Items - Sides
INSERT INTO menu_items (id, category_id, name, description, ingredients, price, currency, weight_label, mark_as_new, popular, active, display_order, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440004', 'Chips & Guacamole', 'Crispy tortilla chips with fresh guacamole', '["Corn Tortilla Chips", "Avocado", "Lime", "Salt", "Cilantro"]', 7.99, 'RON', '250g', FALSE, TRUE, TRUE, 1, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440004', 'Chips & Salsa', 'Crispy chips with homemade tomato salsa', '["Corn Tortilla Chips", "Tomatoes", "Onions", "Cilantro", "Jalapeños"]', 5.99, 'RON', '200g', FALSE, FALSE, TRUE, 2, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440004', 'Arroz Mexicano', 'Mexican rice with tomatoes, corn, and peppers', '["Rice", "Tomatoes", "Corn", "Bell Peppers", "Cilantro"]', 5.99, 'RON', '180g', FALSE, FALSE, TRUE, 3, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440004', 'Frijoles Refritos', 'Traditional refried black beans with cheese', '["Black Beans", "Lard", "Cheese", "Garlic", "Cumin"]', 4.99, 'RON', '150g', FALSE, FALSE, TRUE, 4, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440004', 'Elote', 'Grilled corn with mayo, cheese, and chili powder', '["Corn on the Cob", "Mayo", "Cotija Cheese", "Chili Powder", "Lime"]', 6.99, 'RON', '150g', TRUE, FALSE, TRUE, 5, NOW(), NOW());

-- Menu Items - Drinks
INSERT INTO menu_items (id, category_id, name, description, ingredients, price, currency, weight_label, mark_as_new, popular, active, display_order, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440005', 'Agua Fresca', 'Traditional refreshing drink with fruit and rice', '["Rice", "Fruit", "Sugar", "Water", "Lime"]', 3.99, 'RON', '350ml', FALSE, FALSE, TRUE, 1, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440005', 'Horchata', 'Creamy rice milk with vanilla and cinnamon', '["Rice Milk", "Vanilla", "Cinnamon", "Sugar"]', 4.99, 'RON', '350ml', FALSE, TRUE, TRUE, 2, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440005', 'Tamarindo', 'Tangy tamarind drink - refreshing and authentic', '["Tamarind Pulp", "Sugar", "Water", "Lime"]', 3.99, 'RON', '350ml', FALSE, FALSE, TRUE, 3, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440005', 'Limonada Fresca', 'Fresh lime juice with mint and sugar', '["Fresh Limes", "Mint", "Sugar", "Water", "Ice"]', 3.99, 'RON', '350ml', FALSE, FALSE, TRUE, 4, NOW(), NOW());

-- Menu Items - Desserts
INSERT INTO menu_items (id, category_id, name, description, ingredients, price, currency, weight_label, mark_as_new, popular, active, display_order, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440006', 'Churros', 'Crispy cinnamon sugar fried pastries with chocolate sauce', '["Flour", "Sugar", "Cinnamon", "Chocolate Sauce"]', 6.99, 'RON', '150g', FALSE, TRUE, TRUE, 1, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440006', 'Flan', 'Creamy custard with caramel sauce - traditional Mexican dessert', '["Eggs", "Milk", "Sugar", "Vanilla"]', 5.99, 'RON', '120g', FALSE, FALSE, TRUE, 2, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440006', 'Tres Leches', 'Light sponge cake soaked in three types of milk', '["Sponge Cake", "Evaporated Milk", "Condensed Milk", "Cream"]', 7.99, 'RON', '150g', TRUE, FALSE, TRUE, 3, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440006', 'Arroz con Leche', 'Creamy rice pudding with cinnamon - comfort dessert', '["Rice", "Milk", "Sugar", "Cinnamon", "Raisins"]', 4.99, 'RON', '150g', FALSE, FALSE, TRUE, 4, NOW(), NOW());
