package com.vento.event;

import com.vento.model.ActivityLog;
import com.vento.model.Notification;
import com.vento.model.User;
import com.vento.repository.ActivityLogRepository;
import com.vento.repository.NotificationRepository;
import com.vento.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class AppEventListener {

    private static final Logger log = LoggerFactory.getLogger(AppEventListener.class);

    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public AppEventListener(NotificationRepository notificationRepository,
                           ActivityLogRepository activityLogRepository,
                           UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    @Async
    @EventListener
    public void handleFileUploaded(FileUploadedEvent event) {
        log.info("File uploaded: {} by user {}", event.getFileName(), event.getUploadedByUserName());

        activityLogRepository.save(ActivityLog.builder()
                .userId(event.getUploadedByUserId())
                .userName(event.getUploadedByUserName())
                .action("upload")
                .targetType("file")
                .targetName(event.getFileName())
                .targetId(event.getFileId())
                .details("File uploaded: " + event.getFileName())
                .build());
    }

    @Async
    @EventListener
    public void handleFileShared(FileSharedEvent event) {
        log.info("File shared: {} by {} to user {}", event.getFileName(), event.getSharedByUserName(), event.getSharedWithUserId());

        activityLogRepository.save(ActivityLog.builder()
                .userId(event.getSharedByUserId())
                .userName(event.getSharedByUserName())
                .action("share")
                .targetType("file")
                .targetName(event.getFileName())
                .targetId(event.getFileId())
                .details("Shared with access level: " + event.getAccessLevel())
                .build());

        // Create notification for the recipient
        User recipient = userRepository.findById(event.getSharedWithUserId()).orElse(null);
        if (recipient != null) {
            notificationRepository.save(Notification.builder()
                    .user(recipient)
                    .type("share")
                    .message(event.getSharedByUserName() + " shared \"" + event.getFileName() + "\" with you (" + event.getAccessLevel() + " access)")
                    .referenceId(event.getFileId())
                    .isRead(false)
                    .build());
        }
    }

    @Async
    @EventListener
    public void handleFileDeleted(FileDeletedEvent event) {
        String actionType = event.isPermanent() ? "permanent_delete" : "delete";
        log.info("File {}: {} by {}", actionType, event.getFileName(), event.getDeletedByUserName());

        activityLogRepository.save(ActivityLog.builder()
                .userId(event.getDeletedByUserId())
                .userName(event.getDeletedByUserName())
                .action(actionType)
                .targetType("file")
                .targetName(event.getFileName())
                .targetId(event.getFileId())
                .details((event.isPermanent() ? "Permanently deleted" : "Moved to trash") + ": " + event.getFileName())
                .build());
    }
}
