package com.team7.carbontrack.repository;

import com.team7.carbontrack.entity.UserStreak;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserStreakRepository extends JpaRepository<UserStreak, Long> {

}