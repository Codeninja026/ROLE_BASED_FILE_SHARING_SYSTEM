package com.vento.event;

import lombok.*;
import org.springframework.context.ApplicationEvent;

@Getter
public class FileSharedEvent extends ApplicationEvent {
    private final Long fileId;
    private final String fileName;
    private final Long sharedByUserId;
    private final String sharedByUserName;
    private final Long sharedWithUserId;
    private final String accessLevel;

    public FileSharedEvent(Object source, Long fileId, String fileName, Long sharedByUserId, String sharedByUserName, Long sharedWithUserId, String accessLevel) {
        super(source);
        this.fileId = fileId;
        this.fileName = fileName;
        this.sharedByUserId = sharedByUserId;
        this.sharedByUserName = sharedByUserName;
        this.sharedWithUserId = sharedWithUserId;
        this.accessLevel = accessLevel;
    }
}
