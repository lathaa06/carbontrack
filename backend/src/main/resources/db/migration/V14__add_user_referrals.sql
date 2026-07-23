ALTER TABLE users ADD COLUMN referred_by_user_id BIGINT;

CREATE INDEX idx_users_referred_by_user_id ON users(referred_by_user_id);
