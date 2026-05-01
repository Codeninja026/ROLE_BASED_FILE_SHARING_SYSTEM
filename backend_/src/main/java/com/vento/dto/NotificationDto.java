package com.vento.dto;

import com.vento.model.Notification;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDto {
    private Long id;
    private String type;
    private String message;
    private Long referenceId;
    private boolean isRead;
    private LocalDateTime timestamp;

    public static NotificationDto from(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .type(n.getType())
                .message(n.getMessage())
                .referenceId(n.getReferenceId())
                .isRead(n.isRead())
                .timestamp(n.getCreatedAt())
                .build();
    }
}
