package com.vento.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SettingsDto {
    private String theme;
    private boolean emailNotifications;
    private boolean pushNotifications;
    private int sessionTimeout;
}
