package com.team7.carbontrack.service;

import com.team7.carbontrack.repository.ActivityLogRepository;
import com.team7.carbontrack.dto.RecommendationInsight;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class RecommendationService {

    private final ActivityLogRepository activityLogRepository;
    private static final Map<String, String> TIP_MAP = new HashMap<>();

    static {
        // Transport tips
        TIP_MAP.put("CAR_PETROL", "Petrol cars emit high carbon. Consider swapping 1-2 commutes per week with biking, walking, or public transit to save substantial CO2.");
        TIP_MAP.put("CAR_DIESEL", "Diesel engines produce high particulate matter and carbon. Consider carpooling or switching to public transit or an EV.");
        TIP_MAP.put("CAR_ELECTRIC", "Even electric cars have indirect emissions based on your grid. Charge during off-peak hours or use solar power if possible.");
        TIP_MAP.put("FLIGHT_SHORT_HAUL", "Short-haul flights have the highest emission intensity per km. For distances under 500 km, consider taking a train.");
        TIP_MAP.put("FLIGHT_LONG_HAUL", "Air travel is a significant part of your footprint. Offset your flights or try replacing international trips with domestic eco-tourism.");
        TIP_MAP.put("PUBLIC_TRANSIT_BUS", "Taking the bus is great! To reduce footprint even further, walk or cycle for trips under 2 km.");
        TIP_MAP.put("PUBLIC_TRANSIT_RAIL", "Train travel is one of the cleanest transit methods. Keep up the green commuting habits!");

        // Electricity tips
        TIP_MAP.put("GRID_ELECTRICITY", "Your grid electricity usage is high. Switch to energy-efficient LED lights, unplug standby appliances, and adjust your thermostat by 1-2 degrees.");
        TIP_MAP.put("RENEWABLE_ELECTRICITY", "Awesome! Using green electricity makes a big difference. Consider sharing your setup to inspire neighbours.");

        // Food tips
        TIP_MAP.put("BEEF_MEAL", "Beef is the highest emission food. Swapping just one beef meal a week for chicken or vegetarian food cuts your diet emissions by 40%.");
        TIP_MAP.put("CHICKEN_MEAL", "Chicken is lower carbon than beef/pork, but try incorporating a few fully plant-based vegan meals into your week.");
        TIP_MAP.put("VEGETARIAN_MEAL", "Vegetarian diets are highly eco-friendly. Watch dairy consumption, as cheese also has a notable footprint.");
        TIP_MAP.put("VEGAN_MEAL", "Excellent choice! Vegan meals represent the lowest possible carbon footprint for food. Keep it up!");

        // Shopping tips
        TIP_MAP.put("CLOTHING", "Clothing production is highly water and carbon intensive. Try buying second-hand, repairing old garments, and avoiding fast-fashion brands.");
        TIP_MAP.put("ELECTRONICS", "Electronics require heavy mineral extraction and transport emissions. Repair before replacing and recycle old devices.");
        TIP_MAP.put("GENERAL_RETAIL", "General retail purchases add up. Practice mindful spending: buy high-quality items that last longer rather than cheap disposables.");
    }

    public RecommendationService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional(readOnly = true)
    public List<String> getPersonalizedRecommendations(Long userId) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<String> topActivities = activityLogRepository.findTopActivitiesByEmission(
                userId, thirtyDaysAgo, PageRequest.of(0, 3)
        );

        List<String> tips = new ArrayList<>();
        for (String activity : topActivities) {
            String tip = TIP_MAP.get(activity);
            if (tip != null) {
                tips.add(tip);
            }
        }

        // Add default tips if user has fewer than 3 high-impact activities
        if (tips.size() < 1) {
            tips.add("Log your daily activities consistently. Tracking is the first step towards lowering your environmental impact.");
        }
        if (tips.size() < 2) {
            tips.add("Did you know? Switching to cold water for washing clothes reduces laundry energy use by up to 90%.");
        }
        if (tips.size() < 3) {
            tips.add("Plant a tree or support verified carbon offset programs to neutralize emissions that are hard to avoid.");
        }

        return tips;
    }

    /**
     * Produces an explainable recommendation feed from the user's own last-30-day data.
     * The saving is deliberately conservative: one practical change per week (15% of
     * the observed impact), projected to a month.
     */
    @Transactional(readOnly = true)
    public List<RecommendationInsight> getRecommendationInsights(Long userId) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Object[]> activities = activityLogRepository.findTopActivityImpacts(
                userId, thirtyDaysAgo, PageRequest.of(0, 3)
        );

        List<RecommendationInsight> insights = new ArrayList<>();
        for (Object[] row : activities) {
            String activityType = String.valueOf(row[0]);
            BigDecimal impact = ((Number) row[1]).doubleValue() == 0
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(((Number) row[1]).doubleValue()).setScale(1, RoundingMode.HALF_UP);
            String tip = TIP_MAP.getOrDefault(activityType,
                    "Choose one lower-impact alternative for this activity each week.");
            BigDecimal saving = impact.multiply(BigDecimal.valueOf(0.15)).setScale(1, RoundingMode.HALF_UP);
            insights.add(new RecommendationInsight(
                    activityType,
                    friendlyName(activityType),
                    shortAction(activityType),
                    tip,
                    impact,
                    saving
            ));
        }

        if (insights.isEmpty()) {
            insights.add(new RecommendationInsight(
                    "GET_STARTED", "Build your first footprint", "Log one activity today",
                    "Your recommendations become more precise after you log everyday transport, food, energy, or shopping choices.",
                    BigDecimal.ZERO, BigDecimal.ZERO
            ));
        }
        return insights;
    }

    private String friendlyName(String activityType) {
        String[] words = activityType.toLowerCase().split("_");
        StringBuilder label = new StringBuilder();
        for (String word : words) {
            if (!label.isEmpty()) {
                label.append(' ');
            }
            label.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
        }
        return label.toString();
    }

    private String shortAction(String activityType) {
        return switch (activityType) {
            case "CAR_PETROL", "CAR_DIESEL" -> "Replace one commute this week";
            case "FLIGHT_SHORT_HAUL", "FLIGHT_LONG_HAUL" -> "Choose rail or combine trips";
            case "GRID_ELECTRICITY" -> "Cut standby power this week";
            case "BEEF_MEAL" -> "Swap one meal for plant-based";
            case "CLOTHING" -> "Try pre-loved before new";
            case "ELECTRONICS" -> "Repair before replacing";
            default -> "Make one lighter choice this week";
        };
    }
}
