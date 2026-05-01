package com.vento.event;

import lombok.*;
import org.springframework.context.ApplicationEvent;

@Getter
public class FolderDeletedEvent extends ApplicationEvent {
    private final Long folderId;
    private final String folderName;
    private final Long deletedByUserId;
    private final String deletedByUserName;
    private final boolean permanent;

    public FolderDeletedEvent(Object source, Long folderId, String folderName, Long deletedByUserId, String deletedByUserName, boolean permanent) {
        super(source);
        this.folderId = folderId;
        this.folderName = folderName;
        this.deletedByUserId = deletedByUserId;
        this.deletedByUserName = deletedByUserName;
        this.permanent = permanent;
    }
}
