package com.vento.controller;

import com.vento.dto.*;
import com.vento.model.User;
import com.vento.service.AuthService;
import com.vento.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications() {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(user.getId())));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        User user = authService.getCurrentUserEntity();
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count)));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        User user = authService.getCurrentUserEntity();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read"));
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read"));
    }
}
