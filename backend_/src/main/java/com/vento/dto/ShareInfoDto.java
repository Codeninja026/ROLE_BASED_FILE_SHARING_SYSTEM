package com.vento.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShareInfoDto {
    private Long permissionId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userAvatar;
    private String accessLevel;
    private Long sharedById;
    private String sharedByName;
    private LocalDateTime sharedAt;
}
