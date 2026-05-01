package com.vento.controller;

import com.vento.dto.*;
import com.vento.model.User;
import com.vento.service.AuthService;
import com.vento.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;
    private final AuthService authService;

    public SettingsController(SettingsService settingsService, AuthService authService) {
        this.settingsService = settingsService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SettingsDto>> getSettings() {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getSettings(user.getId())));
    }

    @PatchMapping
    public ResponseEntity<ApiResponse<SettingsDto>> updateSettings(@RequestBody SettingsDto dto) {
        User user = authService.getCurrentUserEntity();
        SettingsDto result = settingsService.updateSettings(user.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Settings updated", result));
    }
}
