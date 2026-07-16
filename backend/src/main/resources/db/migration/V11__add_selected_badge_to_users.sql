ALTER TABLE users ADD COLUMN selected_badge VARCHAR(50);

INSERT INTO badges (name, description, trigger_type, threshold) VALUES
    ('Eco Warrior', 'Log a transportation activity 15 days in a row', 'STREAK', 15.00),
    ('Planet Protector', 'Log a transportation activity 30 days in a row', 'STREAK', 30.00)
ON CONFLICT (name) DO NOTHING;
