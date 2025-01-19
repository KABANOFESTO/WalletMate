-- Insert test user with BCrypt-encoded password ('password123')
INSERT INTO users (name, email, password, role, created_at, updated_at)
SELECT 'Test User', 'test@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'test@example.com'
);

-- password: password123
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'kabanofesto1@gmail.com';
