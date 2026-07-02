-- V5: Badge catalogue and the join table recording who earned what (Milestone 1
-- schema; the award engine itself is built in Milestone 2 via Spring events).

CREATE TABLE badges (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(80)     NOT NULL UNIQUE,
    description     VARCHAR(255)    NOT NULL,
    trigger_type    VARCHAR(15)     NOT NULL,   -- STREAK / GOAL / REDUCTION
    threshold       NUMERIC(10, 2)  NOT NULL,   -- e.g. 7 (days), 10/25/50 (kg CO2e reduced)
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_badge_trigger_type CHECK (trigger_type IN ('STREAK', 'GOAL', 'REDUCTION'))
);

CREATE TABLE user_badges (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id        BIGINT          NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
