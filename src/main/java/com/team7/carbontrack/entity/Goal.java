package com.team7.carbontrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Schema for Milestone 1. Progress calculation, on-track projection, and alerts
 * are implemented on top of this in Milestone 2 (Analytics Engine).
 */
@Entity
@Table(name = "goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "target_reduction_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal targetReductionPct;

    @Column(name = "period_days", nullable = false)
    private Integer periodDays;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "baseline_co2e_kg", precision = 14, scale = 6)
    private BigDecimal baselineCo2eKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private GoalStatus status = GoalStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
