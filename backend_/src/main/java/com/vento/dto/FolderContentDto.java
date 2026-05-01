package com.vento.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FolderContentDto {
    private FolderDto currentFolder;
    private List<FolderDto> folders;
    private List<FileDto> files;
    private List<FolderDto> breadcrumbs;
}
