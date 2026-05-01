package com.vento.service;

import com.vento.dto.*;
import com.vento.model.*;
import com.vento.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final FilePermissionRepository permissionRepository;
    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardService(FileRepository fileRepository, FolderRepository folderRepository,
                           UserRepository userRepository, FilePermissionRepository permissionRepository,
                           NotificationRepository notificationRepository, ActivityLogRepository activityLogRepository) {
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.notificationRepository = notificationRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public DashboardDto getDashboard(User currentUser) {
        boolean isAdmin = currentUser.getRole().equals(Role.ROLE_ADMIN);
        Long userId = currentUser.getId();

        // --- ALL metrics are user-scoped unless ADMIN ---
        long totalFiles = isAdmin ? fileRepository.countActiveFiles() : fileRepository.countByOwnerAndNotDeleted(userId);
        long totalFolders = isAdmin ? folderRepository.countByDeletedFalse() : folderRepository.countByOwnerIdAndDeletedFalse(userId);
        long totalUsers = isAdmin ? userRepository.count() : 0;
        long usedBytes = isAdmin ? fileRepository.sumTotalFileSize() : fileRepository.sumFileSizeByOwner(userId);
        long totalBytes = 100L * 1024 * 1024 * 1024;
        long starredCount = isAdmin ? (fileRepository.countStarred() + folderRepository.countStarred()) 
                : (fileRepository.countStarredByOwner(userId) + folderRepository.countStarredByOwner(userId));
        long sharedCount = isAdmin ? permissionRepository.countSharedFiles() : permissionRepository.countSharedByUser(userId);
        long trashedCount = isAdmin ? fileRepository.countTrashed() : fileRepository.countTrashedByOwner(userId);
        long notificationCount = notificationRepository.countByUserIdAndIsReadFalse(userId);

        // Type distribution - user-scoped
        Map<String, Long> typeDist = new HashMap<>();
        List<Object[]> mimeData = isAdmin ? fileRepository.countByMimeType() : fileRepository.countByMimeTypeForOwner(userId);
        for (Object[] row : mimeData) {
            String t = (String) row[0];
            Long c = (Long) row[1];
            String cat = categorizeType(t);
            typeDist.merge(cat, c, Long::sum);
        }

        // Recent activity - user-scoped
        List<ActivityLogDto> recentActivity;
        if (isAdmin) {
            recentActivity = activityLogRepository.findTop10ByOrderByCreatedAtDesc()
                    .stream().map(ActivityLogDto::from).collect(Collectors.toList());
        } else {
            recentActivity = activityLogRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId)
                    .stream().map(ActivityLogDto::from).collect(Collectors.toList());
        }

        // Recent files - user-scoped
        List<FileDto> recentFiles;
        if (isAdmin) {
            recentFiles = fileRepository.findByDeletedFalseOrderByCreatedAtDesc().stream()
                    .limit(10).map(FileDto::from).collect(Collectors.toList());
        } else {
            recentFiles = fileRepository.findByOwnerIdAndDeletedFalseOrderByCreatedAtDesc(userId)
                    .stream().limit(10).map(FileDto::from).collect(Collectors.toList());
        }

        // Monthly Growth - user-scoped
        List<Object[]> rawGrowth = isAdmin ? fileRepository.countByMonth() : fileRepository.countByMonthForOwner(userId);
        List<MonthlyGrowthDto> growthData = rawGrowth.stream()
                .map(row -> MonthlyGrowthDto.builder()
                        .month((String) row[0])
                        .fileCount(((Number) row[1]).longValue())
                        .storageUsed(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());
        // Sort for chronological display in charts
        Collections.reverse(growthData);

        return DashboardDto.builder()
                .totalFiles(totalFiles)
                .totalFolders(totalFolders)
                .totalUsers(totalUsers)
                .usedBytes(usedBytes)
                .totalBytes(totalBytes)
                .percentage(totalBytes > 0 ? (double) usedBytes / totalBytes * 100 : 0)
                .starredCount(starredCount)
                .sharedCount(sharedCount)
                .trashedCount(trashedCount)
                .notificationCount(notificationCount)
                .typeDistribution(typeDist)
                .growthData(growthData)
                .recentActivity(recentActivity)
                .recentFiles(recentFiles)
                .build();
    }

    private String categorizeType(String mimeType) {
        if (mimeType == null) return "other";
        if (mimeType.startsWith("image/")) return "images";
        if (mimeType.startsWith("video/")) return "videos";
        if (mimeType.startsWith("audio/")) return "audio";
        if (mimeType.contains("pdf") || mimeType.contains("word") || mimeType.contains("document")) return "documents";
        if (mimeType.contains("sheet") || mimeType.contains("excel")) return "spreadsheets";
        if (mimeType.contains("presentation") || mimeType.contains("powerpoint")) return "presentations";
        if (mimeType.contains("zip") || mimeType.contains("rar") || mimeType.contains("tar")) return "archives";
        return "other";
    }
}
