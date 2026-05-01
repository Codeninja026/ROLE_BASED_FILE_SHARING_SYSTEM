package com.vento.event;

import lombok.*;
import org.springframework.context.ApplicationEvent;

@Getter
public class FileDeletedEvent extends ApplicationEvent {
    private final Long fileId;
    private final String fileName;
    private final Long deletedByUserId;
    private final String deletedByUserName;
    private final boolean permanent;

    public FileDeletedEvent(Object source, Long fileId, String fileName, Long deletedByUserId, String deletedByUserName, boolean permanent) {
        super(source);
        this.fileId = fileId;
        this.fileName = fileName;
        this.deletedByUserId = deletedByUserId;
        this.deletedByUserName = deletedByUserName;
        this.permanent = permanent;
    }
}
