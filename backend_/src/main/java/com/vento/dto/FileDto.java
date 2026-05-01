package com.vento.dto;

import com.vento.model.FileEntity;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FileDto {
    private Long id;
    private String name;
    private String extension;
    private String mimeType;
    private Long fileSize;
    private boolean starred;
    private boolean deleted;
    private LocalDateTime deletedAt;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerAvatar;
    private Long folderId;
    private String folderName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ShareInfoDto> sharedWith;
    private String myAccessLevel;

    public static FileDto from(FileEntity file) {
        return FileDto.builder()
                .id(file.getId())
                .name(file.getOriginalName())
                .extension(file.getExtension())
                .mimeType(file.getMimeType())
                .fileSize(file.getFileSize())
                .starred(file.isStarred())
                .deleted(file.isDeleted())
                .deletedAt(file.getDeletedAt())
                .ownerId(file.getOwner().getId())
                .ownerName(file.getOwner().getName())
                .ownerEmail(file.getOwner().getEmail())
                .ownerAvatar(file.getOwner().getAvatarUrl())
                .folderId(file.getFolder() != null ? file.getFolder().getId() : null)
                .folderName(file.getFolder() != null ? file.getFolder().getName() : null)
                .createdAt(file.getCreatedAt())
                .updatedAt(file.getUpdatedAt())
                .build();
    }
}
