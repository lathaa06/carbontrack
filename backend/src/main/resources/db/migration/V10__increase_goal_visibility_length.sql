-- V10: Increase goal_visibility character length limit from 10 to 20 to support 'LEADERBOARD' (11 characters).
ALTER TABLE users ALTER COLUMN goal_visibility TYPE VARCHAR(20);
