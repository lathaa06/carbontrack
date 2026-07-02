package com.team7.carbontrack.repository;

import com.team7.carbontrack.entity.ActivityCategory;
import com.team7.carbontrack.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {

    /**
     * The lookup the emission calculation engine relies on for every logged activity.
     * Only one factor should ever be active for a given (category, activityType, unit);
     * if more than one is active (e.g. mid-revision), the most recent effective_date wins.
     */
    Optional<EmissionFactor> findFirstByCategoryAndActivityTypeAndUnitAndActiveTrueOrderByEffectiveDateDesc(
            ActivityCategory category, String activityType, String unit);

    List<EmissionFactor> findByCategoryAndActiveTrue(ActivityCategory category);

    List<EmissionFactor> findByActiveTrue();
}
