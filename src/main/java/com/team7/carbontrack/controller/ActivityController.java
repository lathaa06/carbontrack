package com.team7.carbontrack.controller;

import com.team7.carbontrack.dto.ActivityLogRequest;
import com.team7.carbontrack.dto.ActivityLogResponse;
import com.team7.carbontrack.security.UserPrincipal;
import com.team7.carbontrack.service.ActivityLogService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * One generic endpoint handles all four activity categories (TRANSPORT,
 * ELECTRICITY, FOOD, SHOPPING) -- the category comes from the request body's
 * "category" field. Jakarta Bean Validation on ActivityLogRequest rejects
 * malformed or out-of-range payloads before the controller method even runs.
 */
@RestController
@RequestMapping("/api/v1/activities")
public class ActivityController {

    private final ActivityLogService activityLogService;

    public ActivityController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @PostMapping
    public ResponseEntity<ActivityLogResponse> logActivity(@AuthenticationPrincipal UserPrincipal principal,
                                                             @Valid @RequestBody ActivityLogRequest request) {
        ActivityLogResponse response = activityLogService.logActivity(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ActivityLogResponse>> getMyActivities(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(activityLogService.getUserActivityLogs(principal.getId(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityLogResponse> getMyActivity(@AuthenticationPrincipal UserPrincipal principal,
                                                               @PathVariable Long id) {
        return ResponseEntity.ok(activityLogService.getUserActivityLog(principal.getId(), id));
    }
}
