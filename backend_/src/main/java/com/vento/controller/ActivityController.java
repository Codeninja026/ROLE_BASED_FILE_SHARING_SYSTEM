package com.vento.controller;

import com.vento.dto.*;
import com.vento.model.User;
import com.vento.service.AuthService;
import com.vento.service.ActivityService;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;
    private final AuthService authService;

    public ActivityController(ActivityService activityService, AuthService authService) {
        this.activityService = activityService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getActivities(
            @RequestParam(required = false) String action) {
        User currentUser = authService.getCurrentUserEntity();
        List<ActivityLogDto> activities;
        if (action != null && !action.equals("all")) {
            activities = activityService.getByAction(action, currentUser);
        } else {
            activities = activityService.getRecentActivities(currentUser);
        }
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ActivityLogDto>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ActivityLogDto> results = activityService.search(q, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(results));
    }
}
