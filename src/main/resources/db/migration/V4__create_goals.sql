-- V4: User-defined sustainability goals (schema only in Milestone 1; progress
-- tracking logic is built in Milestone 2).

CREATE TABLE goals (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_reduction_pct    NUMERIC(5, 2)   NOT NULL CHECK (target_reduction_pct > 0 AND target_reduction_pct <= 100),
    period_days             INTEGER         NOT NULL CHECK (period_days > 0),
    start_date              DATE            NOT NULL,
    baseline_co2e_kg        NUMERIC(14, 6),
    status                  VARCHAR(15)     NOT NULL DEFAULT 'ACTIVE', -- ACTIVE / ACHIEVED / MISSED
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_goal_status CHECK (status IN ('ACTIVE', 'ACHIEVED', 'MISSED'))
);

CREATE INDEX idx_goals_user_status ON goals(user_id, status);
