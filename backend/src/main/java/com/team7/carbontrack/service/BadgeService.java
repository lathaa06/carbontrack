package com.team7.carbontrack.service;

import com.team7.carbontrack.entity.*;
import com.team7.carbontrack.repository.*;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;

    public BadgeService(BadgeRepository badgeRepository,
                        UserBadgeRepository userBadgeRepository,
                        GoalRepository goalRepository,
                        ActivityLogRepository activityLogRepository) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.goalRepository = goalRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @EventListener
    @Transactional
    public void onActivityLogged(ActivityLoggedEvent event) {
        Long userId = event.getUserId();
        ActivityLog log = event.getActivityLog();

        // 1. First Log check
        long activityCount = activityLogRepository.countByUserId(userId);
        if (activityCount >= 1) {
            awardBadge(userId, "First Log");
        }

        // 2. Streak check (7, 15, 30 day logging streak of TRANSPORT)
        if (log.getCategory() == ActivityCategory.TRANSPORT) {
            LocalDate logDate = log.getLogDate();
            List<ActivityLog> transportLogs = activityLogRepository.findByUserIdAndCategoryAndLogDateBetween(
                    userId, ActivityCategory.TRANSPORT, logDate.minusDays(45), logDate
            );
            Set<LocalDate> dates = transportLogs.stream()
                    .map(ActivityLog::getLogDate)
                    .collect(Collectors.toSet());

            int currentStreak = 0;
            for (int i = 0; i < 45; i++) {
                if (dates.contains(logDate.minusDays(i))) {
                    currentStreak++;
                } else {
                    break;
                }
            }

            if (currentStreak >= 7) {
                awardBadge(userId, "Green Commuter");
            }
            if (currentStreak >= 15) {
                awardBadge(userId, "Eco Warrior");
            }
            if (currentStreak >= 30) {
                awardBadge(userId, "Planet Protector");
            }
        }
    }

    @EventListener
    @Transactional
    public void onGoalAchieved(GoalAchievedEvent event) {
        Long userId = event.getUserId();

        // 1. Goal check (First Step)
        List<Goal> achieved = goalRepository.findByUserIdAndStatus(userId, GoalStatus.ACHIEVED);
        if (!achieved.isEmpty()) {
            awardBadge(userId, "First Step");
        }

        // 2. Reduction check (10/25/50 kg reduction)
        BigDecimal totalSaved = BigDecimal.ZERO;
        for (Goal g : achieved) {
            BigDecimal actualCo2e = activityLogRepository.findByUserIdAndLogDateBetween(
                    userId, g.getStartDate(), g.getStartDate().plusDays(g.getPeriodDays() - 1)
            ).stream()
                    .map(ActivityLog::getCo2eKg)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal saved = g.getBaselineCo2eKg().subtract(actualCo2e);
            if (saved.compareTo(BigDecimal.ZERO) > 0) {
                totalSaved = totalSaved.add(saved);
            }
        }

        if (totalSaved.compareTo(new BigDecimal("10.00")) >= 0) {
            awardBadge(userId, "Carbon Saver 10");
        }
        if (totalSaved.compareTo(new BigDecimal("25.00")) >= 0) {
            awardBadge(userId, "Carbon Saver 25");
        }
        if (totalSaved.compareTo(new BigDecimal("50.00")) >= 0) {
            awardBadge(userId, "Carbon Saver 50");
        }
    }

    @Transactional
    public void awardBadge(Long userId, String badgeName) {
        Optional<Badge> badgeOpt = badgeRepository.findAll().stream()
                .filter(b -> b.getName().equalsIgnoreCase(badgeName))
                .findFirst();

        if (badgeOpt.isPresent()) {
            Badge badge = badgeOpt.get();
            // Check if user already has it
            List<UserBadge> existing = userBadgeRepository.findByUserId(userId);
            boolean hasBadge = existing.stream().anyMatch(ub -> ub.getBadgeId().equals(badge.getId()));
            if (!hasBadge) {
                UserBadge userBadge = UserBadge.builder()
                        .userId(userId)
                        .badgeId(badge.getId())
                        .build();
                userBadgeRepository.save(userBadge);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Badge> getUserBadges(Long userId) {
        List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);
        List<Long> badgeIds = userBadges.stream().map(UserBadge::getBadgeId).collect(Collectors.toList());
        return badgeRepository.findAllById(badgeIds);
    }
}
