package com.team7.carbontrack.service;

import com.team7.carbontrack.dto.ActivityLogRequest;
import com.team7.carbontrack.dto.ActivityLogResponse;
import com.team7.carbontrack.entity.ActivityLog;
import com.team7.carbontrack.exception.ResourceNotFoundException;
import com.team7.carbontrack.repository.ActivityLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.team7.carbontrack.entity.User;
import com.team7.carbontrack.entity.UserStreak;
import com.team7.carbontrack.repository.UserRepository;
import com.team7.carbontrack.repository.UserStreakRepository;

import java.time.LocalDate;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final EmissionCalculationService emissionCalculationService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final UserRepository userRepository;
    private final UserStreakRepository userStreakRepository;
    public ActivityLogService(ActivityLogRepository activityLogRepository,
                              EmissionCalculationService emissionCalculationService,
                              org.springframework.context.ApplicationEventPublisher eventPublisher,
                              UserRepository userRepository,
                              UserStreakRepository userStreakRepository) {

        this.activityLogRepository = activityLogRepository;
        this.emissionCalculationService = emissionCalculationService;
        this.eventPublisher = eventPublisher;
        this.userRepository = userRepository;
        this.userStreakRepository = userStreakRepository;
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "dashboardSummary", allEntries = true)
    public ActivityLogResponse logActivity(Long userId, ActivityLogRequest request) {
        // Step 1: ask the calculation engine "how much CO2e is this?"
        EmissionCalculationService.CalculationResult result = emissionCalculationService.calculate(
                request.category(), request.activityType(), request.unit(), request.quantity());

        // Step 2: build the row and save it, with the computed value attached.
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .category(request.category())
                .activityType(request.activityType())
                .quantity(request.quantity())
                .unit(request.unit())
                .co2eKg(result.co2eKg())
                .emissionFactorId(result.factorUsed().getId())
                .logDate(request.logDate())
                .notes(request.notes())
                .build();

        ActivityLog saved = activityLogRepository.save(log);
        // Update user's streak
        updateUserStreak(userId, saved.getLogDate());
        eventPublisher.publishEvent(new ActivityLoggedEvent(this, userId, saved));
        return ActivityLogResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLogResponse> getUserActivityLogs(Long userId, Pageable pageable) {
        return activityLogRepository.findByUserIdOrderByLogDateDesc(userId, pageable)
                .map(ActivityLogResponse::from);
    }

    @Transactional(readOnly = true)
    public ActivityLogResponse getUserActivityLog(Long userId, Long logId) {
        ActivityLog log = activityLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity log not found: " + logId));

        // A user should never be able to read another user's log by guessing its id.
        if (!log.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Activity log not found: " + logId);
        }
        return ActivityLogResponse.from(log);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "dashboardSummary", allEntries = true)
    public void deleteActivityLog(Long userId, Long logId) {
        ActivityLog log = activityLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity log not found: " + logId));

        if (!log.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Activity log not found: " + logId);
        }
        activityLogRepository.delete(log);
    }
    private void updateUserStreak(Long userId, java.time.LocalDate activityDate) {

        // Ensure the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + userId));

        UserStreak streak = userStreakRepository.findById(userId)
                .orElse(
                        UserStreak.builder()
                                .userId(userId)
                                .currentStreak(0)
                                .longestStreak(0)
                                .build()
                );

        LocalDate lastDate = streak.getLastActivityDate();

        // First activity ever
        if (lastDate == null) {

            streak.setCurrentStreak(1);
            streak.setLongestStreak(1);

        }

        // Already logged today
        else if (lastDate.equals(activityDate)) {

            return;

        }

        // Yesterday
        else if (lastDate.plusDays(1).equals(activityDate)) {

            streak.setCurrentStreak(streak.getCurrentStreak() + 1);

            if (streak.getCurrentStreak() > streak.getLongestStreak()) {

                streak.setLongestStreak(streak.getCurrentStreak());

            }

        }

        // Missed one or more days
        else {

            streak.setCurrentStreak(1);

        }

        streak.setLastActivityDate(activityDate);

        userStreakRepository.save(streak);
    }
}
