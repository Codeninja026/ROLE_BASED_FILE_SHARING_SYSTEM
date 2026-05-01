package com.vento.dto;

import com.vento.model.Folder;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FolderDto {
    private Long id;
    private String name;
    private Long parentId;
    private String parentName;
    private Long ownerId;
    private String ownerName;
    @Builder.Default
    private long fileCount = 0;
    @Builder.Default
    private long subFolderCount = 0;
    private boolean starred;
    private java.util.List<ShareInfoDto> sharedWith;
    private LocalDateTime createdAt;

    public static FolderDto from(Folder folder) {
        return FolderDto.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
                .parentName(folder.getParent() != null ? folder.getParent().getName() : null)
                .ownerId(folder.getOwner().getId())
                .ownerName(folder.getOwner().getName())
                .starred(folder.isStarred())
                .createdAt(folder.getCreatedAt())
                .build();
    }
}
