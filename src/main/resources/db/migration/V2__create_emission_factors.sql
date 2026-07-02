-- V2: Emission factors are the rule-engine backbone. Stored in the DB (not code) so
-- admins can revise them as IPCC/EPA tables change, without a redeploy.

CREATE TABLE emission_factors (
    id                  BIGSERIAL PRIMARY KEY,
    category            VARCHAR(20)     NOT NULL,   -- TRANSPORT / ELECTRICITY / FOOD / SHOPPING
    activity_type       VARCHAR(60)     NOT NULL,   -- e.g. CAR_PETROL, FLIGHT_SHORT_HAUL, GRID_ELECTRICITY, BEEF_MEAL
    unit                VARCHAR(20)     NOT NULL,   -- e.g. KM, KWH, SERVING, USD
    kg_co2e_per_unit    NUMERIC(12, 6)  NOT NULL CHECK (kg_co2e_per_unit >= 0),
    source              VARCHAR(100)    NOT NULL,   -- e.g. 'IPCC AR6', 'EPA 2024'
    effective_date      DATE            NOT NULL,
    active              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_ef_category CHECK (category IN ('TRANSPORT', 'ELECTRICITY', 'FOOD', 'SHOPPING')),
    -- Only one active factor per (category, activity_type, unit) at a time so lookups are deterministic.
    CONSTRAINT uq_ef_active_lookup UNIQUE (category, activity_type, unit, effective_date)
);

CREATE INDEX idx_ef_lookup ON emission_factors(category, activity_type, unit, active);
