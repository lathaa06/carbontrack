package com.team7.carbontrack.repository;

import com.team7.carbontrack.entity.ActivityCategory;
import com.team7.carbontrack.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findByUserIdOrderByLogDateDesc(Long userId, Pageable pageable);

    List<ActivityLog> findByUserIdAndCategoryAndLogDateBetween(
            Long userId, ActivityCategory category, LocalDate from, LocalDate to);

    List<ActivityLog> findByUserIdAndLogDateBetween(Long userId, LocalDate from, LocalDate to);

    // Aggregation (JPQL GROUP BY / SUM) is built out in Milestone 2's Analytics Engine;
    // this repository only owns persistence for Milestone 1.
}
