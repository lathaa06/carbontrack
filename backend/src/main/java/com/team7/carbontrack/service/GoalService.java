package com.team7.carbontrack.service;

import com.team7.carbontrack.dto.DashboardSummary;
import com.team7.carbontrack.entity.Goal;
import com.team7.carbontrack.entity.GoalStatus;
import com.team7.carbontrack.repository.ActivityLogRepository;
import com.team7.carbontrack.repository.GoalRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ApplicationEventPublisher eventPublisher;

    public GoalService(GoalRepository goalRepository,
                       ActivityLogRepository activityLogRepository,
                       ApplicationEventPublisher eventPublisher) {
        this.goalRepository = goalRepository;
        this.activityLogRepository = activityLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    @CacheEvict(value = "dashboardSummary", key = "#userId + ':' + T(java.time.LocalDate).now()")
    public Goal createGoal(Long userId, BigDecimal targetReductionPct, Integer periodDays) {
        // Deactivate existing active goals
        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, GoalStatus.ACTIVE);
        for (Goal g : activeGoals) {
            g.setStatus(GoalStatus.MISSED);
            goalRepository.save(g);
        }

        LocalDate today = LocalDate.now();

        // Baseline: sum of emissions in the last 30 days
        BigDecimal last30DaysEmissions = activityLogRepository.findByUserIdAndLogDateBetween(
                userId, today.minusDays(30), today.minusDays(1)
        ).stream()
                .map(com.team7.carbontrack.entity.ActivityLog::getCo2eKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (last30DaysEmissions.compareTo(BigDecimal.ZERO) <= 0) {
            // Sensible fallback: 10 kg CO2e per day
            last30DaysEmissions = new BigDecimal("300.00");
        }

        // Scale baseline to target period
        BigDecimal baselineCo2eKg = last30DaysEmissions
                .multiply(new BigDecimal(periodDays))
                .divide(new BigDecimal("30.00"), 6, RoundingMode.HALF_UP);

        Goal goal = Goal.builder()
                .userId(userId)
                .targetReductionPct(targetReductionPct)
                .periodDays(periodDays)
                .startDate(today)
                .baselineCo2eKg(baselineCo2eKg)
                .status(GoalStatus.ACTIVE)
                .build();

        return goalRepository.save(goal);
    }

    @Transactional(readOnly = true)
    public List<Goal> getGoals(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    @Transactional
    public DashboardSummary.ActiveGoalProgress getActiveGoalProgress(Long userId) {
        List<Goal> active = goalRepository.findByUserIdAndStatus(userId, GoalStatus.ACTIVE);
        if (active.isEmpty()) {
            return null;
        }

        Goal goal = active.get(0);
        LocalDate today = LocalDate.now();

        // Days elapsed
        long daysElapsed = ChronoUnit.DAYS.between(goal.getStartDate(), today) + 1;

        // Bound evaluation end-date to the end of the goal period if it has ended
        LocalDate evaluationEndDate = today;
        if (daysElapsed > goal.getPeriodDays()) {
            evaluationEndDate = goal.getStartDate().plusDays(goal.getPeriodDays() - 1);
        }

        // Calculate current emissions in this goal period
        BigDecimal currentCo2e = activityLogRepository.findByUserIdAndLogDateBetween(
                userId, goal.getStartDate(), evaluationEndDate
        ).stream()
                .map(com.team7.carbontrack.entity.ActivityLog::getCo2eKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        // Target emissions
        BigDecimal multiplier = BigDecimal.ONE.subtract(
                goal.getTargetReductionPct().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
        );
        BigDecimal targetCo2e = goal.getBaselineCo2eKg()
                .multiply(multiplier)
                .setScale(2, RoundingMode.HALF_UP);

        // Check if goal period has ended
        if (daysElapsed > goal.getPeriodDays()) {
            if (currentCo2e.compareTo(targetCo2e) <= 0) {
                goal.setStatus(GoalStatus.ACHIEVED);
                goalRepository.save(goal);
                // Publish goal achieved event
                eventPublisher.publishEvent(new GoalAchievedEvent(this, userId, goal));
            } else {
                goal.setStatus(GoalStatus.MISSED);
                goalRepository.save(goal);
            }
            return null; // No longer active
        }

        // Progress percentage
        BigDecimal progressPct = BigDecimal.ZERO;
        if (targetCo2e.compareTo(BigDecimal.ZERO) > 0) {
            progressPct = currentCo2e
                    .divide(targetCo2e, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(1, RoundingMode.HALF_UP);
        }

        // Projection
        BigDecimal dailyAvg = currentCo2e.divide(new BigDecimal(daysElapsed), 4, RoundingMode.HALF_UP);
        BigDecimal projectedCo2e = dailyAvg.multiply(new BigDecimal(goal.getPeriodDays()));

        String trajectoryStatus = projectedCo2e.compareTo(targetCo2e) <= 0 ? "ON_TRACK" : "OFF_TRACK";
        String alertMessage = trajectoryStatus.equals("ON_TRACK")
                ? "Great job! You are currently on track to achieve your carbon reduction goal."
                : "Warning! Your current emission trajectory exceeds your target. Try to reduce travel or meat meals to get back on track.";

        return new DashboardSummary.ActiveGoalProgress(
                goal.getId(),
                goal.getTargetReductionPct(),
                goal.getPeriodDays(),
                goal.getStartDate(),
                goal.getBaselineCo2eKg().setScale(2, RoundingMode.HALF_UP),
                targetCo2e,
                currentCo2e,
                progressPct,
                trajectoryStatus,
                alertMessage
        );
    }
}
