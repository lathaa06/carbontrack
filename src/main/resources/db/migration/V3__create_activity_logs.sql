-- V3: Every logged activity across the four categories, with the computed CO2e
-- persisted at insert time by the emission calculation engine.

CREATE TABLE activity_logs (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category            VARCHAR(20)     NOT NULL,   -- TRANSPORT / ELECTRICITY / FOOD / SHOPPING
    activity_type       VARCHAR(60)     NOT NULL,
    quantity            NUMERIC(12, 4)  NOT NULL CHECK (quantity >= 0),
    unit                VARCHAR(20)     NOT NULL,
    co2e_kg             NUMERIC(14, 6)  NOT NULL,   -- computed = quantity * emission_factors.kg_co2e_per_unit
    emission_factor_id  BIGINT          REFERENCES emission_factors(id),
    log_date            DATE            NOT NULL,
    notes               VARCHAR(500),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_al_category CHECK (category IN ('TRANSPORT', 'ELECTRICITY', 'FOOD', 'SHOPPING'))
);

-- Aggregation queries (daily/weekly/monthly, by category) are the hottest read path.
CREATE INDEX idx_al_user_date ON activity_logs(user_id, log_date);
CREATE INDEX idx_al_user_category_date ON activity_logs(user_id, category, log_date);
