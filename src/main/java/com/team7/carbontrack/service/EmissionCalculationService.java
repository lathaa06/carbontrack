package com.team7.carbontrack.service;

import com.team7.carbontrack.entity.ActivityCategory;
import com.team7.carbontrack.entity.EmissionFactor;
import com.team7.carbontrack.exception.EmissionFactorNotFoundException;
import com.team7.carbontrack.repository.EmissionFactorRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * The emission calculation engine described in the project brief:
 * "look up the configured emission factor for that activity type and unit,
 *  multiply by quantity, and store the resulting kg CO2e value".
 *
 * Emission factors live in the database (see EmissionFactor / V2 + V7 migrations),
 * never hardcoded here — that's what makes this a "rule engine" instead of a
 * pile of if/else statements. Admins can add or update a row in emission_factors
 * and every future calculation picks it up automatically, no redeploy needed.
 */
@Service
public class EmissionCalculationService {

    // kg CO2e values are rounded to 6 decimal places to match the DB column precision (14,6).
    private static final int CO2E_SCALE = 6;

    private final EmissionFactorRepository emissionFactorRepository;

    public EmissionCalculationService(EmissionFactorRepository emissionFactorRepository) {
        this.emissionFactorRepository = emissionFactorRepository;
    }

    /**
     * Result of a calculation: both the computed value and which factor was used,
     * so the caller can persist emission_factor_id on the activity log for traceability.
     */
    public record CalculationResult(BigDecimal co2eKg, EmissionFactor factorUsed) {}

    public CalculationResult calculate(ActivityCategory category, String activityType, String unit, BigDecimal quantity) {
        EmissionFactor factor = findActiveFactor(category, activityType, unit);

        BigDecimal co2eKg = quantity
                .multiply(factor.getKgCo2ePerUnit())
                .setScale(CO2E_SCALE, RoundingMode.HALF_UP);

        return new CalculationResult(co2eKg, factor);
    }

    private EmissionFactor findActiveFactor(ActivityCategory category, String activityType, String unit) {
        return emissionFactorRepository
                .findFirstByCategoryAndActivityTypeAndUnitAndActiveTrueOrderByEffectiveDateDesc(category, activityType, unit)
                .orElseThrow(() -> new EmissionFactorNotFoundException(
                        ("No active emission factor found for category=%s, activityType=%s, unit=%s. "
                                + "Ask an admin to add one to emission_factors.")
                                .formatted(category, activityType, unit)));
    }
}
