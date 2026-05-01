package com.vento.dto;

import com.vento.model.ActivityLog;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityLogDto {
    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private String targetType;
    private String targetName;
    private Long targetId;
    private String details;
    private LocalDateTime timestamp;

    public static ActivityLogDto from(ActivityLog log) {
        return ActivityLogDto.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userName(log.getUserName())
                .action(log.getAction())
                .targetType(log.getTargetType())
                .targetName(log.getTargetName())
                .targetId(log.getTargetId())
                .details(log.getDetails())
                .timestamp(log.getCreatedAt())
                .build();
    }
}
