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
 * Rule-engine backbone: a configurable kg CO2e-per-unit factor for a given
 * (category, activity_type, unit). Stored in the DB so it can be revised by
 * admins as IPCC/EPA reference tables change, without a code deployment.
 */
@Entity
@Table(name = "emission_factors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmissionFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityCategory category;

    @Column(name = "activity_type", nullable = false, length = 60)
    private String activityType;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "kg_co2e_per_unit", nullable = false, precision = 12, scale = 6)
    private BigDecimal kgCo2ePerUnit;

    @Column(nullable = false, length = 100)
    private String source;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

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
