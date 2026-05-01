package com.vento.service;

import com.vento.dto.*;
import com.vento.exception.ResourceNotFoundException;
import com.vento.model.*;
import com.vento.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final FileRepository fileRepository;
    private final ActivityLogRepository activityLogRepository;

    public FolderService(FolderRepository folderRepository, FileRepository fileRepository,
                        ActivityLogRepository activityLogRepository) {
        this.folderRepository = folderRepository;
        this.fileRepository = fileRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public FolderDto createFolder(String name, Long parentId, User currentUser) {
        Folder parent = null;
        if (parentId != null) {
            parent = folderRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found"));
        }

        Folder folder = Folder.builder()
                .name(name)
                .parent(parent)
                .owner(currentUser)
                .deleted(false)
                .build();

        folder = folderRepository.save(folder);

        activityLogRepository.save(ActivityLog.builder()
                .userId(currentUser.getId())
                .userName(currentUser.getName())
                .action("folder_create")
                .targetType("folder")
                .targetName(name)
                .targetId(folder.getId())
                .build());

        return enrichFolder(folder);
    }

    public List<FolderDto> getRootFolders(User currentUser) {
        return folderRepository.findByOwnerIdAndParentIsNullAndDeletedFalse(currentUser.getId())
                .stream().map(this::enrichFolder).collect(Collectors.toList());
    }

    public List<FolderDto> getSubFolders(Long parentId) {
        return folderRepository.findByParentIdAndDeletedFalse(parentId)
                .stream().map(this::enrichFolder).collect(Collectors.toList());
    }

    public List<FileDto> getFolderFiles(Long folderId) {
        return fileRepository.findByFolderIdAndDeletedFalseOrderByCreatedAtDesc(folderId)
                .stream().map(FileDto::from).collect(Collectors.toList());
    }

    @Transactional
    public FolderDto renameFolder(Long folderId, String newName, User currentUser) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        if (!folder.getOwner().getId().equals(currentUser.getId()) && !currentUser.getRole().equals(Role.ROLE_ADMIN)) {
            throw new com.vento.exception.BadRequestException("Access denied");
        }

        folder.setName(newName);
        folder = folderRepository.save(folder);
        return enrichFolder(folder);
    }

    @Transactional
    public void deleteFolder(Long folderId, User currentUser) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        if (!folder.getOwner().getId().equals(currentUser.getId()) && !currentUser.getRole().equals(Role.ROLE_ADMIN)) {
            throw new com.vento.exception.BadRequestException("Access denied");
        }

        folder.setDeleted(true);
        folderRepository.save(folder);

        activityLogRepository.save(ActivityLog.builder()
                .userId(currentUser.getId())
                .userName(currentUser.getName())
                .action("folder_delete")
                .targetType("folder")
                .targetName(folder.getName())
                .targetId(folder.getId())
                .build());
    }

    private FolderDto enrichFolder(Folder folder) {
        FolderDto dto = FolderDto.from(folder);
        dto.setFileCount(fileRepository.findByFolderIdAndDeletedFalseOrderByCreatedAtDesc(folder.getId()).size());
        dto.setSubFolderCount(folderRepository.findByParentIdAndDeletedFalse(folder.getId()).size());
        return dto;
    }
}
