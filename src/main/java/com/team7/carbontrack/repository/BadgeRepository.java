package com.team7.carbontrack.repository;

import com.team7.carbontrack.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
}
