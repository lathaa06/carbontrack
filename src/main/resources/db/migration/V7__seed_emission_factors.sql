-- V7: Seed a starter set of emission factors so the calculation engine and its
-- tests have real data to work against on day one. Values are representative
-- IPCC/EPA-style averages for teaching purposes, not a certified emissions audit.

INSERT INTO emission_factors (category, activity_type, unit, kg_co2e_per_unit, source, effective_date) VALUES
    -- Transport
    ('TRANSPORT', 'CAR_PETROL',        'KM',      0.192000, 'EPA 2024',  '2024-01-01'),
    ('TRANSPORT', 'CAR_DIESEL',        'KM',      0.171000, 'EPA 2024',  '2024-01-01'),
    ('TRANSPORT', 'CAR_ELECTRIC',      'KM',      0.053000, 'IPCC AR6',  '2024-01-01'),
    ('TRANSPORT', 'FLIGHT_SHORT_HAUL', 'KM',      0.255000, 'IPCC AR6',  '2024-01-01'),
    ('TRANSPORT', 'FLIGHT_LONG_HAUL',  'KM',      0.150000, 'IPCC AR6',  '2024-01-01'),
    ('TRANSPORT', 'PUBLIC_TRANSIT_BUS','KM',      0.089000, 'EPA 2024',  '2024-01-01'),
    ('TRANSPORT', 'PUBLIC_TRANSIT_RAIL','KM',     0.041000, 'EPA 2024',  '2024-01-01'),

    -- Electricity (varies by grid source)
    ('ELECTRICITY', 'GRID_ELECTRICITY',  'KWH',   0.475000, 'IPCC AR6',  '2024-01-01'),
    ('ELECTRICITY', 'RENEWABLE_ELECTRICITY', 'KWH', 0.041000, 'IPCC AR6', '2024-01-01'),

    -- Food (per meal/serving)
    ('FOOD', 'BEEF_MEAL',        'SERVING', 6.610000, 'IPCC AR6', '2024-01-01'),
    ('FOOD', 'CHICKEN_MEAL',     'SERVING', 1.570000, 'IPCC AR6', '2024-01-01'),
    ('FOOD', 'VEGETARIAN_MEAL',  'SERVING', 0.890000, 'IPCC AR6', '2024-01-01'),
    ('FOOD', 'VEGAN_MEAL',       'SERVING', 0.520000, 'IPCC AR6', '2024-01-01'),

    -- Shopping (per unit currency spent, category-level proxy factors)
    ('SHOPPING', 'CLOTHING',      'USD', 0.400000, 'EPA 2024', '2024-01-01'),
    ('SHOPPING', 'ELECTRONICS',   'USD', 0.320000, 'EPA 2024', '2024-01-01'),
    ('SHOPPING', 'GENERAL_RETAIL','USD', 0.250000, 'EPA 2024', '2024-01-01');
