-- Check if reports table exists
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_income DECIMAL(19,2),
    total_expense DECIMAL(19,2),
    generated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
