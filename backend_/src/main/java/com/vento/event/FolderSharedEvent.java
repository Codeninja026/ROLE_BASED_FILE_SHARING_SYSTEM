package com.vento.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class FolderSharedEvent extends ApplicationEvent {
    private final Long folderId;
    private final String folderName;
    private final Long sharedById;
    private final String sharedByName;
    private final Long sharedWithId;
    private final String accessLevel;

    public FolderSharedEvent(Object source, Long folderId, String folderName, Long sharedById, String sharedByName, Long sharedWithId, String accessLevel) {
        super(source);
        this.folderId = folderId;
        this.folderName = folderName;
        this.sharedById = sharedById;
        this.sharedByName = sharedByName;
        this.sharedWithId = sharedWithId;
        this.accessLevel = accessLevel;
    }
}
