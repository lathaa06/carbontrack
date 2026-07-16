package com.team7.carbontrack.repository;

import com.team7.carbontrack.dto.CategoryEmission;
import com.team7.carbontrack.dto.DailyEmission;
import com.team7.carbontrack.entity.ActivityCategory;
import com.team7.carbontrack.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findByUserIdOrderByLogDateDesc(Long userId, Pageable pageable);

    List<ActivityLog> findByUserIdAndCategoryAndLogDateBetween(
            Long userId, ActivityCategory category, LocalDate from, LocalDate to);

    List<ActivityLog> findByUserIdAndLogDateBetween(Long userId, LocalDate from, LocalDate to);

    @Query("SELECT new com.team7.carbontrack.dto.CategoryEmission(al.category, SUM(al.co2eKg)) " +
           "FROM ActivityLog al WHERE al.userId = :userId AND al.logDate BETWEEN :startDate AND :endDate " +
           "GROUP BY al.category")
    List<CategoryEmission> getEmissionsByCategory(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT new com.team7.carbontrack.dto.DailyEmission(al.logDate, SUM(al.co2eKg)) " +
           "FROM ActivityLog al WHERE al.userId = :userId AND al.logDate BETWEEN :startDate AND :endDate " +
           "GROUP BY al.logDate ORDER BY al.logDate ASC")
    List<DailyEmission> getDailyEmissions(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT al.activityType FROM ActivityLog al WHERE al.userId = :userId AND al.logDate >= :startDate " +
           "GROUP BY al.activityType ORDER BY SUM(al.co2eKg) DESC")
    List<String> findTopActivitiesByEmission(Long userId, LocalDate startDate, Pageable pageable);

    @Query("SELECT new com.team7.carbontrack.dto.CategoryEmission(al.category, SUM(al.co2eKg) / COUNT(DISTINCT al.userId)) " +
           "FROM ActivityLog al WHERE al.logDate >= :startDate GROUP BY al.category")
    List<CategoryEmission> getPlatformCategoryAverages(LocalDate startDate);

    @Query("SELECT al.userId, SUM(al.co2eKg) FROM ActivityLog al WHERE al.logDate >= :startDate GROUP BY al.userId")
    List<Object[]> getUserTotalEmissions(LocalDate startDate);

    @Query("SELECT new com.team7.carbontrack.dto.CategoryEmission(al.category, SUM(al.co2eKg)) " +
           "FROM ActivityLog al JOIN User u ON al.userId = u.id " +
           "WHERE u.orgId = :orgId AND al.logDate BETWEEN :startDate AND :endDate " +
           "GROUP BY al.category")
    List<CategoryEmission> getOrganisationEmissionsByCategory(Long orgId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(al.co2eKg) " +
           "FROM ActivityLog al JOIN User u ON al.userId = u.id " +
           "WHERE u.orgId = :orgId AND al.logDate BETWEEN :startDate AND :endDate")
    BigDecimal getOrganisationTotalEmissions(Long orgId, LocalDate startDate, LocalDate endDate);

    @Query("""
       SELECT COALESCE(SUM(al.co2eKg), 0)
       FROM ActivityLog al
       WHERE al.userId = :userId
       AND al.logDate BETWEEN :startDate AND :endDate
       """)
    BigDecimal getTotalEmissions(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );
}

