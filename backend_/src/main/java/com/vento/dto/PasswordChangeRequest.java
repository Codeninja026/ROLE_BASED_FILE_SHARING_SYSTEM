package com.vento.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PasswordChangeRequest {
    private String currentPassword;
    private String newPassword;
}
