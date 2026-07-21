CREATE TABLE user_streaks (
    user_id BIGINT PRIMARY KEY,

    current_streak INTEGER NOT NULL DEFAULT 0,

    longest_streak INTEGER NOT NULL DEFAULT 0,

    last_activity_date DATE,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_streak_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);