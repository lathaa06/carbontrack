INSERT INTO badges (name, description, trigger_type, threshold) VALUES
    ('First Log', 'Log your very first carbon activity', 'STREAK', 1.00)
ON CONFLICT (name) DO NOTHING;
