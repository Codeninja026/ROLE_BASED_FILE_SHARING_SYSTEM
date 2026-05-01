package com.vento.dto;

import com.vento.model.User;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private String role;
    private boolean active;
    private String provider;
    private Long teamId;
    private String teamName;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name().replace("ROLE_", "").toLowerCase())
                .active(user.isActive())
                .provider(user.getProvider().name())
                .teamId(user.getTeam() != null ? user.getTeam().getId() : null)
                .teamName(user.getTeam() != null ? user.getTeam().getName() : null)
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
