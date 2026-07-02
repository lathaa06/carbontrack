package com.team7.carbontrack.repository;

import com.team7.carbontrack.entity.Goal;
import com.team7.carbontrack.entity.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserIdAndStatus(Long userId, GoalStatus status);

    List<Goal> findByUserId(Long userId);
}
