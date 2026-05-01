package com.vento.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MonthlyGrowthDto {
    private String month;
    private long fileCount;
    private long storageUsed;
}
