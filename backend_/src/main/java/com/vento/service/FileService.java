package com.vento.service;

import com.vento.dto.*;
import com.vento.event.*;
import com.vento.exception.*;
import com.vento.model.*;
import com.vento.repository.*;
import com.vento.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FileService {

    private static final Logger log = LoggerFactory.getLogger(FileService.class);

    private final FileRepository fileRepository;
    private final FilePermissionRepository permissionRepository;
    private final FolderRepository folderRepository;
    private final FolderPermissionRepository folderPermissionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final ApplicationEventPublisher eventPublisher;

    public FileService(FileRepository fileRepository, FilePermissionRepository permissionRepository,
            FolderRepository folderRepository, FolderPermissionRepository folderPermissionRepository,
            ActivityLogRepository activityLogRepository, NotificationRepository notificationRepository, 
            UserRepository userRepository, StorageService storageService, ApplicationEventPublisher eventPublisher) {
        this.fileRepository = fileRepository;
        this.permissionRepository = permissionRepository;
        this.folderRepository = folderRepository;
        this.folderPermissionRepository = folderPermissionRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public FileDto uploadFile(MultipartFile file, Long folderId, User currentUser, String path) {
        String rawName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed";
        // Sanitize: extract only the base filename (strip path if browser included it)
        String originalName = rawName.replace("\\", "/");
        if (originalName.contains("/")) {
            originalName = originalName.substring(originalName.lastIndexOf("/") + 1);
        }

        String extension = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx > 0)
            extension = originalName.substring(dotIdx + 1);

        String mimeType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        Folder targetFolder = null;

        // 1. Handle explicit folderId (from UI context)
        if (folderId != null) {
            targetFolder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        }

        // 2. Resolve hierarchical path (from webkitRelativePath for folder uploads)
        if (path != null && !path.trim().isEmpty()) {
            String cleanPath = path.trim();
            // Normalize separators
            cleanPath = cleanPath.replace("\\", "/");
            String[] parts = cleanPath.split("/");

            // Determine which parts are folder names (exclude the filename at the end)
            List<String> folderParts = new ArrayList<>();
            for (int i = 0; i < parts.length; i++) {
                String part = parts[i].trim();
                if (part.isEmpty())
                    continue;
                // Last part might be the filename itself - skip it
                if (i == parts.length - 1 && part.equals(originalName))
                    continue;
                folderParts.add(part);
            }

            Folder currentParent = targetFolder;
            for (String folderName : folderParts) {
                Optional<Folder> existing = folderName == null ? Optional.empty()
                        : (currentParent == null
                                ? folderRepository.findByNameAndParentIsNullAndOwner(folderName, currentUser)
                                : folderRepository.findByNameAndParentAndOwner(folderName, currentParent, currentUser));
                if (existing.isPresent()) {
                    currentParent = existing.get();
                } else {
                    Folder newFolder = Folder.builder()
                            .name(folderName)
                            .parent(currentParent)
                            .owner(currentUser)
                            .build();
                    currentParent = folderRepository.save(newFolder);
                }
            }
            targetFolder = currentParent;
        }

        // Validate access to the target folder
        if (targetFolder != null && !targetFolder.getOwner().getId().equals(currentUser.getId()) &&
                !currentUser.getRole().equals(Role.ROLE_ADMIN)) {
            throw new BadRequestException("You don't have permission to upload to this folder");
        }

        // Store file on disk
        String storedPath;
        try {
            Long targetFolderId = targetFolder != null ? targetFolder.getId() : null;
            storedPath = storageService.store(file, currentUser.getId(), targetFolderId);
        } catch (Exception ex) {
            log.error("Failed to store file on disk: {}", originalName, ex);
            throw new BadRequestException("File storage failed: " + ex.getMessage());
        }

        // Save DB record
        try {
            FileEntity entity = FileEntity.builder()
                    .originalName(originalName)
                    .storedName(storedPath.substring(storedPath.lastIndexOf('/') + 1))
                    .extension(extension)
                    .mimeType(mimeType)
                    .fileSize(file.getSize())
                    .filePath(storedPath)
                    .owner(currentUser)
                    .folder(targetFolder)
                    .starred(false)
                    .deleted(false)
                    .build();

            entity = fileRepository.save(entity);

            eventPublisher.publishEvent(new FileUploadedEvent(
                    this, entity.getId(), originalName, currentUser.getId(), currentUser.getName()));

            log.info("File uploaded: {} in directory {} by {} (size: {} bytes)",
                    originalName, path != null ? path : "root", currentUser.getEmail(), file.getSize());

            return FileDto.from(entity);
        } catch (Exception ex) {
            storageService.delete(storedPath);
            log.error("DB save failed, rolled back file storage: {}", originalName, ex);
            throw new BadRequestException("File upload failed: " + ex.getMessage());
        }
    }

    public Resource downloadFile(Long fileId, User currentUser) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        if (file.isDeleted()) {
            throw new BadRequestException("File is in trash");
        }

        // Check access
        validateAccess(file, currentUser, AccessLevel.VIEW);

        log.info("File downloaded: {} by {}", file.getOriginalName(), currentUser.getEmail());

        return storageService.loadAsResource(file.getFilePath());
    }

    @Transactional(readOnly = true)
    public List<FileDto> getUserFiles(User currentUser) {
        List<FileEntity> files = fileRepository.findByOwnerIdAndDeletedFalseOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .filter(f -> f.getFolder() == null) // Only top-level files
                .collect(Collectors.toList());
        return files.stream().map(f -> {
            FileDto dto = FileDto.from(f);
            dto.setSharedWith(getShareInfo(f.getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FolderContentDto getFolderContents(Long folderId, User user) {
        boolean isAdmin = user.getRole().equals(Role.ROLE_ADMIN);

        Folder current = null;
        if (folderId != null) {
            current = folderRepository.findById(folderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
            // Validate access
            if (!isAdmin && !current.getOwner().getId().equals(user.getId())) {
                throw new BadRequestException("Access denied");
            }
        }

        List<Folder> subFolders;
        List<FileEntity> files;

        if (current == null) {
            subFolders = folderRepository.findByOwnerIdAndParentIsNullAndDeletedFalse(user.getId());
            files = fileRepository.findByOwnerIdAndDeletedFalseOrderByCreatedAtDesc(user.getId()).stream()
                    .filter(f -> f.getFolder() == null)
                    .collect(Collectors.toList());
        } else {
            subFolders = folderRepository.findByOwnerIdAndParentIdAndDeletedFalse(user.getId(), folderId);
            files = fileRepository.findByFolderIdAndDeletedFalseOrderByCreatedAtDesc(folderId);
        }

        // Build breadcrumbs
        List<FolderDto> breadcrumbs = new ArrayList<>();
        Folder temp = current;
        while (temp != null) {
            breadcrumbs.add(0, FolderDto.from(temp));
            temp = temp.getParent();
        }

        return FolderContentDto.builder()
                .currentFolder(current != null ? FolderDto.from(current) : null)
                .folders(subFolders.stream().map(FolderDto::from).collect(Collectors.toList()))
                .files(files.stream().map(FileDto::from).collect(Collectors.toList()))
                .breadcrumbs(breadcrumbs)
                .build();
    }

    @Transactional
    public FolderDto createFolder(String name, Long parentId, User user) {
        Folder parent = null;
        if (parentId != null) {
            parent = folderRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found"));
        }

        // Check if folder with same name exists in same parent
        if (folderRepository.findByNameAndParentAndOwner(name, parent, user).isPresent()) {
            throw new BadRequestException("Folder with name '" + name + "' already exists here");
        }

        Folder folder = Folder.builder()
                .name(name)
                .parent(parent)
                .owner(user)
                .deleted(false)
                .build();

        folder = folderRepository.save(folder);
        log.info("Folder created: {} by {}", name, user.getEmail());
        return FolderDto.from(folder);
    }

    @Transactional(readOnly = true)
    public List<FileDto> getAllFiles(User currentUser) {
        if (!currentUser.getRole().equals(Role.ROLE_ADMIN)) {
            if (currentUser.getRole().equals(Role.ROLE_MANAGER)) {
                List<FileEntity> files = fileRepository.findVisibleFilesForManager(currentUser.getId());
                return files.stream().map(f -> {
                    FileDto dto = FileDto.from(f);
                    dto.setSharedWith(getShareInfo(f.getId()));
                    return dto;
                }).collect(Collectors.toList());
            }
            return getUserFiles(currentUser);
        }
        List<FileEntity> files = fileRepository.findByDeletedFalseOrderByCreatedAtDesc();
        return files.stream().map(f -> {
            FileDto dto = FileDto.from(f);
            dto.setSharedWith(getShareInfo(f.getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FileDto> getSharedWithMe(User currentUser) {
        List<FilePermission> permissions = permissionRepository.findSharedWithUser(currentUser.getId());
        return permissions.stream().map(p -> {
            FileDto dto = FileDto.from(p.getFile());
            dto.setMyAccessLevel(p.getAccessLevel().name());
            dto.setSharedWith(getShareInfo(p.getFile().getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FolderDto> getSharedFoldersWithMe(User currentUser) {
        List<FolderPermission> permissions = folderPermissionRepository.findSharedWithUser(currentUser.getId());
        return permissions.stream().map(p -> {
            FolderDto dto = FolderDto.from(p.getFolder());
            dto.setSharedWith(getFolderShareInfo(p.getFolder().getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FolderContentDto getStarred(User currentUser) {
        boolean isAdmin = currentUser.getRole().equals(Role.ROLE_ADMIN);
        boolean isManager = currentUser.getRole().equals(Role.ROLE_MANAGER);
        Long userId = currentUser.getId();

        List<FileEntity> files;
        List<Folder> folders = new ArrayList<>();
        
        if (isAdmin) {
            files = fileRepository.findByStarredTrueAndDeletedFalseOrderByCreatedAtDesc();
            folders = folderRepository.findByStarredTrueAndDeletedFalseOrderByCreatedAtDesc();
        } else if (isManager) {
            files = fileRepository.findStarredByManagerScope(userId);
            folders = new ArrayList<>(folderRepository.findStarredByManagerScope(userId));
            
            // Also include starred folders shared with the manager (avoid duplicates)
            List<FolderPermission> sharedPermissions = folderPermissionRepository.findSharedWithUser(userId);
            Set<Long> folderIds = folders.stream().map(Folder::getId).collect(Collectors.toSet());
            List<Folder> sharedStarredFolders = sharedPermissions.stream()
                .map(FolderPermission::getFolder)
                .filter(folder -> folder.isStarred() && !folder.isDeleted() && !folderIds.contains(folder.getId()))
                .collect(Collectors.toList());
            folders.addAll(sharedStarredFolders);
            
            // Sort combined folders by createdAt desc
            folders.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        } else {
            files = fileRepository.findByOwnerIdAndStarredTrueAndDeletedFalseOrderByCreatedAtDesc(userId);
            folders = new ArrayList<>(folderRepository.findByOwnerIdAndStarredTrueAndDeletedFalseOrderByCreatedAtDesc(userId));
            
            // Also include starred folders shared with the user (avoid duplicates)
            List<FolderPermission> sharedPermissions = folderPermissionRepository.findSharedWithUser(userId);
            Set<Long> folderIds = folders.stream().map(Folder::getId).collect(Collectors.toSet());
            List<Folder> sharedStarredFolders = sharedPermissions.stream()
                .map(FolderPermission::getFolder)
                .filter(folder -> folder.isStarred() && !folder.isDeleted() && !folderIds.contains(folder.getId()))
                .collect(Collectors.toList());
            folders.addAll(sharedStarredFolders);
            
            // Sort combined folders by createdAt desc
            folders.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        }

        return FolderContentDto.builder()
                .files(files.stream().map(FileDto::from).collect(Collectors.toList()))
                .folders(folders.stream().map(this::enrichFolder).collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<FileDto> getTrash(User currentUser) {
        if (currentUser.getRole().equals(Role.ROLE_ADMIN)) {
            return fileRepository.findByDeletedTrueOrderByDeletedAtDesc()
                    .stream().map(FileDto::from).collect(Collectors.toList());
        }
        return fileRepository.findByOwnerIdAndDeletedTrueOrderByDeletedAtDesc(currentUser.getId())
                .stream().map(FileDto::from).collect(Collectors.toList());
    }

    @Transactional
    public FileDto toggleStar(Long fileId, User currentUser) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        validateOwnerOrAdmin(file, currentUser);

        file.setStarred(!file.isStarred());
        file = fileRepository.save(file);
        return FileDto.from(file);
    }

    @Transactional
    public FileDto renameFile(Long fileId, String newName, User currentUser) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        validateAccess(file, currentUser, AccessLevel.EDIT);

        file.setOriginalName(newName);
        file = fileRepository.save(file);

        log.info("File renamed: {} -> {} by {}", file.getOriginalName(), newName, currentUser.getEmail());
        return FileDto.from(file);
    }

    @Transactional
    public FileDto softDelete(Long fileId, User currentUser) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        // Allow owner, admin, OR users with MANAGE permission
        validateAccessForDelete(file, currentUser);

        file.setDeleted(true);
        file.setDeletedAt(LocalDateTime.now());
        file = fileRepository.save(file);

        eventPublisher.publishEvent(new FileDeletedEvent(
                this, file.getId(), file.getOriginalName(), currentUser.getId(), currentUser.getName(), false));

        log.info("File soft-deleted: {} by {}", file.getOriginalName(), currentUser.getEmail());
        return FileDto.from(file);
    }

    @Transactional
    public void softDeleteFolder(Long folderId, User currentUser) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        validateOwnerOrAdmin(folder, currentUser);

        recursiveSoftDelete(folder, currentUser);

        eventPublisher.publishEvent(new FolderDeletedEvent(
                this, folder.getId(), folder.getName(), currentUser.getId(), currentUser.getName(), false));

        log.info("Folder soft-deleted: {} by {}", folder.getName(), currentUser.getEmail());
    }

    private void recursiveSoftDelete(Folder folder, User currentUser) {
        folder.setDeleted(true);
        folder.setUpdatedAt(LocalDateTime.now());
        folderRepository.save(folder);

        // Delete all files in this folder
        List<FileEntity> files = fileRepository.findByFolderId(folder.getId());
        for (FileEntity file : files) {
            if (!file.isDeleted()) {
                file.setDeleted(true);
                file.setDeletedAt(LocalDateTime.now());
                fileRepository.save(file);
            }
        }

        // Recurse subfolders
        List<Folder> subfolders = folderRepository.findByParentId(folder.getId());
        for (Folder sub : subfolders) {
            if (!sub.isDeleted()) {
                recursiveSoftDelete(sub, currentUser);
            }
        }
    }

    @Transactional
    public FileDto restoreFile(Long fileId, User currentUser) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        validateOwnerOrAdmin(file, currentUser);

        file.setDeleted(false);
        file.setDeletedAt(null);
        file = fileRepository.save(file);

        log.info("File restored: {} by {}", file.getOriginalName(), currentUser.getEmail());
        return FileDto.from(file);
    }

    @Transactional
    public void permanentDelete(Long fileId, User currentUser) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        // Allow owner, admin, OR users with MANAGE permission
        validateAccessForDelete(file, currentUser);

        // Delete physical file
        storageService.delete(file.getFilePath());

        // Delete permissions
        permissionRepository.findByFileId(fileId).forEach(p -> permissionRepository.delete(p));

        String fileName = file.getOriginalName();
        fileRepository.delete(file);

        eventPublisher.publishEvent(new FileDeletedEvent(
                this, fileId, fileName, currentUser.getId(), currentUser.getName(), true));

        log.info("File permanently deleted: {} by {}", fileName, currentUser.getEmail());
    }

    @Transactional(readOnly = true)
    public Page<FileDto> search(String query, User currentUser, Pageable pageable) {
        Page<FileEntity> results;
        if (currentUser.getRole().equals(Role.ROLE_ADMIN)) {
            results = fileRepository.searchAll(query, pageable);
        } else if (currentUser.getRole().equals(Role.ROLE_MANAGER)) {
            results = fileRepository.searchByManagerScope(currentUser.getId(), query, pageable);
        } else {
            results = fileRepository.searchByOwner(currentUser.getId(), query, pageable);
        }
        return results.map(FileDto::from);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMetrics(User currentUser) {
        Map<String, Object> metrics = new HashMap<>();
        boolean isAdmin = currentUser.getRole().equals(Role.ROLE_ADMIN);
        boolean isManager = currentUser.getRole().equals(Role.ROLE_MANAGER);
        Long userId = currentUser.getId();

        // 1. Storage & Capacities
        long usedBytes = isAdmin ? fileRepository.sumTotalFileSize()
                : isManager ? fileRepository.sumFileSizeByManagerScope(userId) : fileRepository.sumFileSizeByOwner(userId);
        long totalBytes = 10L * 1024 * 1024 * 1024; // 10GB
        metrics.put("usedBytes", usedBytes);
        metrics.put("totalBytes", totalBytes);
        metrics.put("percentage", totalBytes > 0 ? (double) usedBytes / totalBytes * 100 : 0);

        // 2. Primary Counts
        long totalFiles = isAdmin ? fileRepository.countActiveFiles()
                : isManager ? fileRepository.countByManagerScope(userId) : fileRepository.countByOwnerAndNotDeleted(userId);
        long folderCount = isAdmin ? folderRepository.countByDeletedFalse()
                : folderRepository.countByOwnerIdAndDeletedFalse(userId);
        long sharedCount = isAdmin ? permissionRepository.countSharedFiles()
                : permissionRepository.countBySharedWithId(userId);
        long starredCount = isAdmin ? (fileRepository.countStarred() + folderRepository.countStarred())
                : isManager ? (fileRepository.countStarredByManagerScope(userId) + folderRepository.countStarredByManagerScope(userId))
                : (fileRepository.countStarredByOwner(userId) + folderRepository.countStarredByOwner(userId));

        metrics.put("totalFiles", totalFiles);
        metrics.put("folderCount", folderCount);
        metrics.put("sharedCount", sharedCount);
        metrics.put("starredCount", starredCount);

        // 3. User Specific Stats
        if (isAdmin) {
            metrics.put("totalUsers", userRepository.count());
        } else if (isManager) {
            metrics.put("totalUsers", userRepository.findByTeam_Manager_Id(userId).size() + 1);
        } else {
            metrics.put("notificationCount", notificationRepository.countByUserIdAndIsReadFalse(userId));
        }

        // 4. Activity & Recent Items
        List<FileEntity> recentFilesList = isAdmin ?
                fileRepository.findTop8ByDeletedFalseOrderByCreatedAtDesc() :
                isManager ? fileRepository.findVisibleFilesForManager(userId).stream().limit(8).collect(Collectors.toList())
                        : fileRepository.findTop8ByOwnerIdAndDeletedFalseOrderByCreatedAtDesc(userId);

        metrics.put("recentFiles", recentFilesList.stream().map(FileDto::from).collect(Collectors.toList()));

        List<ActivityLog> recentActivityList = isAdmin ?
                activityLogRepository.findTop10ByOrderByCreatedAtDesc() :
                isManager ? activityLogRepository.findByUserIdsOrderByCreatedAtDesc(
                        userRepository.findByTeam_Manager_Id(userId).stream()
                                .map(User::getId)
                                .collect(Collectors.collectingAndThen(Collectors.toList(), ids -> {
                                    ids.add(userId);
                                    return ids;
                                }))).stream().limit(10).collect(Collectors.toList())
                        : activityLogRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);

        metrics.put("recentActivity", recentActivityList);

        // 5. Type distribution
        Map<String, Long> typeDistribution = new HashMap<>();
        List<Object[]> mimeData = isAdmin ? fileRepository.countByMimeType()
                : isManager ? fileRepository.countByMimeTypeForManagerScope(userId)
                        : fileRepository.countByMimeTypeForOwner(userId);
        for (Object[] row : mimeData) {
            String type = (String) row[0];
            Long count = (Long) row[1];
            String category = categorizeType(type);
            typeDistribution.merge(category, count, Long::sum);
        }
        metrics.put("typeDistribution", typeDistribution);

        return metrics;
    }

    private String categorizeType(String mimeType) {
        if (mimeType == null)
            return "others";
        String mime = mimeType.toLowerCase();
        if (mime.startsWith("image/"))
            return "images";
        if (mime.startsWith("video/"))
            return "videos";
        if (mime.startsWith("audio/"))
            return "audio";
        if (mime.contains("pdf") || mime.contains("word") || mime.contains("document") || mime.contains("text/plain"))
            return "documents";
        if (mime.contains("spreadsheet") || mime.contains("excel") || mime.contains("csv") || mime.contains("sheet"))
            return "spreadsheets";
        if (mime.contains("zip") || mime.contains("rar") || mime.contains("tar") || mime.contains("archive"))
            return "archives";
        return "others";
    }

    private List<ShareInfoDto> getShareInfo(Long fileId) {
        return permissionRepository.findByFileId(fileId).stream()
                .map(p -> ShareInfoDto.builder()
                        .permissionId(p.getId())
                        .userId(p.getSharedWith().getId())
                        .userName(p.getSharedWith().getName())
                        .userEmail(p.getSharedWith().getEmail())
                        .userAvatar(p.getSharedWith().getAvatarUrl())
                        .accessLevel(p.getAccessLevel().name())
                        .sharedById(p.getSharedBy().getId())
                        .sharedByName(p.getSharedBy().getName())
                        .sharedAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private List<ShareInfoDto> getFolderShareInfo(Long folderId) {
        return folderPermissionRepository.findByFolderId(folderId).stream()
                .map(p -> ShareInfoDto.builder()
                        .permissionId(p.getId())
                        .userId(p.getSharedWith().getId())
                        .userName(p.getSharedWith().getName())
                        .userEmail(p.getSharedWith().getEmail())
                        .userAvatar(p.getSharedWith().getAvatarUrl())
                        .accessLevel(p.getAccessLevel().name())
                        .sharedById(p.getSharedBy().getId())
                        .sharedByName(p.getSharedBy().getName())
                        .sharedAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private void validateAccess(FileEntity file, User user, AccessLevel minLevel) {
        // Owner always has full access
        if (file.getOwner().getId().equals(user.getId()))
            return;
        // Admin always has full access
        if (user.getRole().equals(Role.ROLE_ADMIN))
            return;
        // Team manager has read access to their team files
        if (minLevel == AccessLevel.VIEW && user.getRole().equals(Role.ROLE_MANAGER) && isManagerOfOwnerTeam(file, user)) {
            return;
        }

        // Check direct file permission
        FilePermission perm = permissionRepository.findByFileIdAndSharedWithId(file.getId(), user.getId()).orElse(null);
        if (perm != null && perm.getAccessLevel().ordinal() >= minLevel.ordinal()) {
            return;
        }
        
        // Inherit permissions from parent folders
        Folder parent = file.getFolder();
        while (parent != null) {
            FolderPermission fPerm = folderPermissionRepository.findByFolderIdAndSharedWithId(parent.getId(), user.getId()).orElse(null);
            if (fPerm != null && fPerm.getAccessLevel().ordinal() >= minLevel.ordinal()) {
                return;
            }
            parent = parent.getParent();
        }

        throw new BadRequestException("Access denied: insufficient permission level");
    }

    private void validateAccess(Folder folder, User user, AccessLevel minLevel) {
        // Owner always has full access
        if (folder.getOwner().getId().equals(user.getId()))
            return;
        // Admin always has full access
        if (user.getRole().equals(Role.ROLE_ADMIN))
            return;
        // Team manager has read access to their team folders
        if (minLevel == AccessLevel.VIEW && user.getRole().equals(Role.ROLE_MANAGER) && isManagerOfFolderOwnerTeam(folder, user)) {
            return;
        }
        
        Folder current = folder;
        while (current != null) {
            FolderPermission fPerm = folderPermissionRepository.findByFolderIdAndSharedWithId(current.getId(), user.getId()).orElse(null);
            if (fPerm != null && fPerm.getAccessLevel().ordinal() >= minLevel.ordinal()) {
                return;
            }
            current = current.getParent();
        }

        throw new BadRequestException("Access denied: insufficient permission level for folder");
    }

    private boolean isManagerOfFolderOwnerTeam(Folder folder, User user) {
        return folder.getOwner().getTeam() != null
                && folder.getOwner().getTeam().getManager() != null
                && folder.getOwner().getTeam().getManager().getId().equals(user.getId());
    }

    /**
     * Validates that the user can delete/manage the file.
     * Allows: owner, admin, or users with MANAGE access level.
     */
    private void validateAccessForDelete(FileEntity file, User user) {
        // Owner always has full access
        if (file.getOwner().getId().equals(user.getId()))
            return;
        // Admin always has full access
        if (user.getRole().equals(Role.ROLE_ADMIN))
            return;

        // Check if user has MANAGE permission
        FilePermission perm = permissionRepository.findByFileIdAndSharedWithId(file.getId(), user.getId())
                .orElse(null);
        if (perm != null && perm.getAccessLevel() == AccessLevel.MANAGE) {
            return; // MANAGE users can delete
        }
        
        // Check folder MANAGE
        Folder parent = file.getFolder();
        while (parent != null) {
            FolderPermission fPerm = folderPermissionRepository.findByFolderIdAndSharedWithId(parent.getId(), user.getId()).orElse(null);
            if (fPerm != null && fPerm.getAccessLevel() == AccessLevel.MANAGE) {
                return;
            }
            parent = parent.getParent();
        }

        throw new BadRequestException(
                "Access denied: only the owner, admin, or users with MANAGE access can delete this file");
    }

    private void validateOwnerOrAdmin(FileEntity file, User user) {
        if (!file.getOwner().getId().equals(user.getId()) && !user.getRole().equals(Role.ROLE_ADMIN)) {
            throw new BadRequestException("Access denied: only the owner or admin can perform this action");
        }
    }

    private void validateOwnerOrAdmin(com.vento.model.Folder folder, User user) {
        if (!folder.getOwner().getId().equals(user.getId()) && !user.getRole().equals(Role.ROLE_ADMIN)) {
            // Also allow MANAGE access from inherited folders
            try {
                validateAccess(folder, user, AccessLevel.MANAGE);
                return;
            } catch (BadRequestException e) {
                // Ignore and throw original exception
            }
            throw new BadRequestException("Access denied: only the owner or admin can perform this action");
        }
    }

    @Transactional
    public FolderDto toggleFolderStar(Long folderId, User currentUser) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        // Allow to star if has VIEW access
        validateAccess(folder, currentUser, AccessLevel.VIEW);

        folder.setStarred(!folder.isStarred());
        folder = folderRepository.save(folder);
        return FolderDto.from(folder);
    }

    @Transactional
    public FolderDto renameFolder(Long folderId, String newName, User currentUser) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        validateAccess(folder, currentUser, AccessLevel.EDIT);

        folder.setName(newName);
        folder = folderRepository.save(folder);

        log.info("Folder renamed to '{}' by {}", newName, currentUser.getEmail());
        return FolderDto.from(folder);
    }

    private boolean isManagerOfOwnerTeam(FileEntity file, User user) {
        return file.getOwner().getTeam() != null
                && file.getOwner().getTeam().getManager() != null
                && file.getOwner().getTeam().getManager().getId().equals(user.getId());
    }

    public void downloadFolderAsZip(Long folderId, User currentUser, java.io.OutputStream outputStream) throws java.io.IOException {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        // Validate access
        validateAccess(folder, currentUser, AccessLevel.VIEW);

        try (java.util.zip.ZipOutputStream zos = new java.util.zip.ZipOutputStream(outputStream)) {
            zipFolderContents(folder, "", zos);
        }
    }

    private void zipFolderContents(Folder folder, String pathPrefix, java.util.zip.ZipOutputStream zos) throws java.io.IOException {
        String currentPath = pathPrefix + folder.getName() + "/";

        // Add folder entry
        zos.putNextEntry(new java.util.zip.ZipEntry(currentPath));
        zos.closeEntry();

        // Get files in this folder
        List<FileEntity> files = fileRepository.findByFolderIdAndDeletedFalseOrderByCreatedAtDesc(folder.getId());
        for (FileEntity file : files) {
            Resource resource = storageService.loadAsResource(file.getFilePath());
            if (resource.exists()) {
                java.util.zip.ZipEntry zipEntry = new java.util.zip.ZipEntry(currentPath + file.getOriginalName());
                zos.putNextEntry(zipEntry);
                org.springframework.util.StreamUtils.copy(resource.getInputStream(), zos);
                zos.closeEntry();
            }
        }

        // Recursively zip subfolders
        List<Folder> subFolders = folderRepository.findByParentId(folder.getId());
        for (Folder sub : subFolders) {
            if (!sub.isDeleted()) {
                zipFolderContents(sub, currentPath, zos);
            }
        }
    }

    private FolderDto enrichFolder(Folder folder) {
        FolderDto dto = FolderDto.from(folder);
        dto.setFileCount(fileRepository.findByFolderIdAndDeletedFalseOrderByCreatedAtDesc(folder.getId()).size());
        dto.setSubFolderCount(folderRepository.findByParentIdAndDeletedFalse(folder.getId()).size());
        return dto;
    }
}
