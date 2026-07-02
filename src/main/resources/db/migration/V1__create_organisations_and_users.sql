-- V1: Core identity tables. Organisations must exist before users can reference them.

CREATE TABLE organisations (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL UNIQUE,
    admin_user_id   BIGINT,             -- FK added in V6 after users.id exists (avoids circular FK at creation time)
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id                      BIGSERIAL PRIMARY KEY,
    username                VARCHAR(50)     NOT NULL UNIQUE,
    email                   VARCHAR(255)    NOT NULL UNIQUE,
    password_hash           VARCHAR(255),                       -- nullable: OAuth2-only users have no local password
    role                    VARCHAR(20)     NOT NULL DEFAULT 'USER', -- USER / ADMIN / ORG_ADMIN
    org_id                  BIGINT REFERENCES organisations(id) ON DELETE SET NULL,
    auth_provider           VARCHAR(20)     NOT NULL DEFAULT 'LOCAL',  -- LOCAL / GOOGLE
    provider_id             VARCHAR(255),                       -- Google subject id, when auth_provider = GOOGLE
    preferred_unit_system   VARCHAR(10)     NOT NULL DEFAULT 'METRIC', -- METRIC / IMPERIAL
    goal_visibility         VARCHAR(10)     NOT NULL DEFAULT 'PRIVATE', -- PRIVATE / LEADERBOARD / PUBLIC
    enabled                 BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN', 'ORG_ADMIN')),
    CONSTRAINT chk_users_auth_provider CHECK (auth_provider IN ('LOCAL', 'GOOGLE')),
    CONSTRAINT chk_users_unit_system CHECK (preferred_unit_system IN ('METRIC', 'IMPERIAL')),
    CONSTRAINT chk_users_goal_visibility CHECK (goal_visibility IN ('PRIVATE', 'LEADERBOARD', 'PUBLIC'))
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_email ON users(email);
