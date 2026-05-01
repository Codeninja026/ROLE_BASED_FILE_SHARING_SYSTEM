package com.vento.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ShareRequest {
    private Long fileId;
    private Long folderId;

    private String email;

    private Long teamId;

    @NotNull(message = "Access level is required")
    private String accessLevel;

    private Boolean shareWithAll;
}
