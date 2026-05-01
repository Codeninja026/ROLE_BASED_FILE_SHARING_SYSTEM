package com.vento.dto;

import lombok.*;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardDto {
    private long totalFiles;
    private long totalFolders;
    private long totalUsers;
    private long usedBytes;
    private long totalBytes;
    private double percentage;
    private long starredCount;
    private long sharedCount;
    private long trashedCount;
    private long notificationCount;
    private java.util.Map<String, Long> typeDistribution;
    private java.util.List<MonthlyGrowthDto> growthData;
    private java.util.List<ActivityLogDto> recentActivity;
    private java.util.List<FileDto> recentFiles;
}
