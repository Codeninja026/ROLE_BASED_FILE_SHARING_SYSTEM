package com.vento.event;

import lombok.*;
import org.springframework.context.ApplicationEvent;

@Getter
public class FileUploadedEvent extends ApplicationEvent {
    private final Long fileId;
    private final String fileName;
    private final Long uploadedByUserId;
    private final String uploadedByUserName;

    public FileUploadedEvent(Object source, Long fileId, String fileName, Long uploadedByUserId, String uploadedByUserName) {
        super(source);
        this.fileId = fileId;
        this.fileName = fileName;
        this.uploadedByUserId = uploadedByUserId;
        this.uploadedByUserName = uploadedByUserName;
    }
}
