package com.vento.service;

import com.vento.dto.SettingsDto;
import com.vento.exception.ResourceNotFoundException;
import com.vento.model.*;
import com.vento.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final UserSettingsRepository settingsRepository;

    public SettingsService(UserSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public SettingsDto getSettings(Long userId) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Settings not found"));
        return SettingsDto.builder()
                .theme(settings.getTheme())
                .emailNotifications(settings.isEmailNotifications())
                .pushNotifications(settings.isPushNotifications())
                .sessionTimeout(settings.getSessionTimeout())
                .build();
    }

    @Transactional
    public SettingsDto updateSettings(Long userId, SettingsDto dto) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Settings not found"));

        if (dto.getTheme() != null) settings.setTheme(dto.getTheme());
        settings.setEmailNotifications(dto.isEmailNotifications());
        settings.setPushNotifications(dto.isPushNotifications());
        if (dto.getSessionTimeout() > 0) settings.setSessionTimeout(dto.getSessionTimeout());

        settingsRepository.save(settings);

        return SettingsDto.builder()
                .theme(settings.getTheme())
                .emailNotifications(settings.isEmailNotifications())
                .pushNotifications(settings.isPushNotifications())
                .sessionTimeout(settings.getSessionTimeout())
                .build();
    }
}
