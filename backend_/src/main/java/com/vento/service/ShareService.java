package com.vento.service;

import com.vento.dto.*;
import com.vento.event.FileSharedEvent;
import com.vento.event.FolderSharedEvent;
import com.vento.exception.*;
import com.vento.model.*;
import com.vento.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ShareService {

    private static final Logger log = LoggerFactory.getLogger(ShareService.class);

    private final FileRepository fileRepository;
    private final FilePermissionRepository permissionRepository;
    private final FolderRepository folderRepository;
    private final FolderPermissionRepository folderPermissionRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ShareService(FileRepository fileRepository, FilePermissionRepository permissionRepository,
                       FolderRepository folderRepository, FolderPermissionRepository folderPermissionRepository,
                       UserRepository userRepository, TeamRepository teamRepository,
                       ApplicationEventPublisher eventPublisher) {
        this.fileRepository = fileRepository;
        this.permissionRepository = permissionRepository;
        this.folderRepository = folderRepository;
        this.folderPermissionRepository = folderPermissionRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public List<ShareInfoDto> shareItem(ShareRequest request, User currentUser) {
        if (request.getFileId() != null) {
            return shareFile(request, currentUser);
        } else if (request.getFolderId() != null) {
            return shareFolder(request, currentUser);
        }
        throw new BadRequestException("Either fileId or folderId must be provided");
    }

    private List<ShareInfoDto> shareFile(ShareRequest request, User currentUser) {
        FileEntity file = fileRepository.findById(request.getFileId())
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        validateShareAuthority(file, currentUser);

        if (file.isDeleted()) {
            throw new BadRequestException("Cannot share a deleted file");
        }

        AccessLevel accessLevel;
        try {
            accessLevel = AccessLevel.valueOf(request.getAccessLevel().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid access level: " + request.getAccessLevel());
        }

        List<User> recipients = Boolean.TRUE.equals(request.getShareWithAll())
                ? getShareAllRecipients(currentUser)
                : currentUser.getRole() == Role.ROLE_ADMIN && request.getEmail() != null && !request.getEmail().trim().isEmpty()
                        ? List.of(getUserRecipient(request))
                : getTeamRecipients(request, currentUser);

        if (recipients.isEmpty()) {
            throw new BadRequestException("No eligible users found to share this file");
        }

        return recipients.stream()
                .filter(Objects::nonNull)
                .filter(sharedWith -> !sharedWith.getId().equals(currentUser.getId()))
                .map(sharedWith -> savePermission(file, currentUser, sharedWith, accessLevel))
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeAccess(Long fileId, Long userId, User currentUser) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        validateShareAuthority(file, currentUser);

        permissionRepository.deleteByFileIdAndSharedWithId(fileId, userId);
        log.info("Access revoked: file {} for user {} by {}", fileId, userId, currentUser.getEmail());
    }

    public List<ShareInfoDto> getFilePermissions(Long fileId, User currentUser) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        // Only owner, admin, manager of scoped team files, or users with MANAGE permission can see permissions
        if (!file.getOwner().getId().equals(currentUser.getId())
                && !currentUser.getRole().equals(Role.ROLE_ADMIN)
                && !(currentUser.getRole().equals(Role.ROLE_MANAGER) && isInManagerScope(file.getOwner(), currentUser))) {
            FilePermission perm = permissionRepository.findByFileIdAndSharedWithId(fileId, currentUser.getId()).orElse(null);
            if (perm == null || perm.getAccessLevel() != AccessLevel.MANAGE) {
                throw new BadRequestException("Access denied");
            }
        }

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

    private void validateShareAuthority(FileEntity file, User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return;
        }

        if (file.getOwner().getId().equals(currentUser.getId())) {
            return;
        }

        if (currentUser.getRole() == Role.ROLE_MANAGER && isInManagerScope(file.getOwner(), currentUser)) {
            return;
        }

        // Allow sharing if user has MANAGE permission
        FilePermission perm = permissionRepository.findByFileIdAndSharedWithId(file.getId(), currentUser.getId()).orElse(null);
        if (perm != null && perm.getAccessLevel() == AccessLevel.MANAGE) {
            return;
        }

        throw new BadRequestException("You do not have permission to share this file");
    }

    private void validateShareAuthority(Folder folder, User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return;
        }

        if (folder.getOwner().getId().equals(currentUser.getId())) {
            return;
        }

        if (currentUser.getRole() == Role.ROLE_MANAGER && isInManagerScope(folder.getOwner(), currentUser)) {
            return;
        }

        // Allow sharing if user has MANAGE permission
        FolderPermission perm = folderPermissionRepository.findByFolderIdAndSharedWithId(folder.getId(), currentUser.getId()).orElse(null);
        if (perm != null && perm.getAccessLevel() == AccessLevel.MANAGE) {
            return;
        }

        throw new BadRequestException("You do not have permission to share this folder");
    }

    private boolean isInManagerScope(User targetUser, User manager) {
        return targetUser.getTeam() != null
                && targetUser.getTeam().getManager() != null
                && targetUser.getTeam().getManager().getId().equals(manager.getId());
    }

    private User getUserRecipient(ShareRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        if (email.isEmpty()) {
            throw new BadRequestException("Email is required when sharing with a user");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private List<User> getTeamRecipients(ShareRequest request, User currentUser) {
        if (request.getTeamId() == null) {
            throw new BadRequestException("Team is required when sharing with a specific team");
        }

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        validateTeamScope(team, currentUser);

        List<User> recipients = userRepository.findByTeamId(team.getId()).stream()
                .filter(member -> member.getRole() == Role.ROLE_USER)
                .filter(member -> !member.getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        User manager = team.getManager();
        if (manager != null && !manager.getId().equals(currentUser.getId())
                && recipients.stream().noneMatch(member -> member.getId().equals(manager.getId()))) {
            recipients.add(manager);
        }

        return recipients;
    }

    private List<User> getShareAllRecipients(User currentUser) {
        if (currentUser.getRole() == Role.ROLE_USER) {
            return getOwnTeamRecipients(currentUser);
        }

        return userRepository.findAll().stream()
                .filter(candidate -> candidate.getRole() != Role.ROLE_ADMIN)
                .filter(candidate -> !candidate.getId().equals(currentUser.getId()))
                .filter(candidate -> canShareWith(candidate, currentUser))
                .collect(Collectors.toList());
    }

    private boolean canShareWith(User candidate, User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return true;
        }

        if (currentUser.getRole() == Role.ROLE_MANAGER) {
            return isInManagerScope(candidate, currentUser);
        }

        return isInSameTeamOrManager(candidate, currentUser);
    }

    private void validateTeamScope(Team team, User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return;
        }

        if (currentUser.getRole() == Role.ROLE_MANAGER
                && team.getManager() != null
                && team.getManager().getId().equals(currentUser.getId())) {
            return;
        }

        if (currentUser.getRole() == Role.ROLE_USER
                && currentUser.getTeam() != null
                && currentUser.getTeam().getId().equals(team.getId())) {
            return;
        }

        throw new BadRequestException("You can share files only with your allowed team scope");
    }

    private List<User> getOwnTeamRecipients(User currentUser) {
        if (currentUser.getTeam() == null) {
            throw new BadRequestException("You are not assigned to a team");
        }

        List<User> recipients = userRepository.findByTeamId(currentUser.getTeam().getId()).stream()
                .filter(member -> !member.getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        User manager = currentUser.getTeam().getManager();
        if (manager != null && !manager.getId().equals(currentUser.getId())
                && recipients.stream().noneMatch(member -> member.getId().equals(manager.getId()))) {
            recipients.add(manager);
        }

        return recipients;
    }

    private boolean isInSameTeamOrManager(User candidate, User currentUser) {
        if (currentUser.getTeam() == null) {
            return false;
        }

        if (candidate.getTeam() != null && candidate.getTeam().getId().equals(currentUser.getTeam().getId())) {
            return true;
        }

        return currentUser.getTeam().getManager() != null
                && currentUser.getTeam().getManager().getId().equals(candidate.getId());
    }

    private ShareInfoDto savePermission(FileEntity file, User currentUser, User sharedWith, AccessLevel accessLevel) {
        FilePermission permission = permissionRepository.findByFileIdAndSharedWithId(file.getId(), sharedWith.getId())
                .orElse(null);

        if (permission != null) {
            permission.setAccessLevel(accessLevel);
        } else {
            permission = FilePermission.builder()
                    .file(file)
                    .sharedBy(currentUser)
                    .sharedWith(sharedWith)
                    .accessLevel(accessLevel)
                    .build();
        }
        permission = permissionRepository.save(permission);

        eventPublisher.publishEvent(new FileSharedEvent(
                this, file.getId(), file.getOriginalName(), currentUser.getId(), currentUser.getName(),
                sharedWith.getId(), accessLevel.name()));

        log.info("File shared: {} -> {} ({}) by {}", file.getOriginalName(), sharedWith.getEmail(),
                accessLevel, currentUser.getEmail());

        return ShareInfoDto.builder()
                .permissionId(permission.getId())
                .userId(sharedWith.getId())
                .userName(sharedWith.getName())
                .userEmail(sharedWith.getEmail())
                .userAvatar(sharedWith.getAvatarUrl())
                .accessLevel(accessLevel.name())
                .sharedById(currentUser.getId())
                .sharedByName(currentUser.getName())
                .sharedAt(permission.getCreatedAt())
                .build();
    }

    private List<ShareInfoDto> shareFolder(ShareRequest request, User currentUser) {
        Folder folder = folderRepository.findById(request.getFolderId())
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        validateShareAuthority(folder, currentUser);

        if (folder.isDeleted()) {
            throw new BadRequestException("Cannot share a deleted folder");
        }

        AccessLevel accessLevel;
        try {
            accessLevel = AccessLevel.valueOf(request.getAccessLevel().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid access level: " + request.getAccessLevel());
        }

        List<User> recipients = Boolean.TRUE.equals(request.getShareWithAll())
                ? getShareAllRecipients(currentUser)
                : currentUser.getRole() == Role.ROLE_ADMIN && request.getEmail() != null && !request.getEmail().trim().isEmpty()
                ? List.of(getUserRecipient(request))
                : getTeamRecipients(request, currentUser);

        if (recipients.isEmpty()) {
            throw new BadRequestException("No eligible users found to share this folder");
        }

        return recipients.stream()
                .filter(Objects::nonNull)
                .filter(sharedWith -> !sharedWith.getId().equals(currentUser.getId()))
                .map(sharedWith -> saveFolderPermission(folder, currentUser, sharedWith, accessLevel))
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeFolderAccess(Long folderId, Long userId, User currentUser) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        validateShareAuthority(folder, currentUser);

        folderPermissionRepository.deleteByFolderIdAndSharedWithId(folderId, userId);
        log.info("Access revoked: folder {} for user {} by {}", folderId, userId, currentUser.getEmail());
    }

    public List<ShareInfoDto> getFolderPermissions(Long folderId, User currentUser) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        if (!folder.getOwner().getId().equals(currentUser.getId())
                && !currentUser.getRole().equals(Role.ROLE_ADMIN)
                && !(currentUser.getRole().equals(Role.ROLE_MANAGER) && isInManagerScope(folder.getOwner(), currentUser))) {
            FolderPermission perm = folderPermissionRepository.findByFolderIdAndSharedWithId(folderId, currentUser.getId()).orElse(null);
            if (perm == null || perm.getAccessLevel() != AccessLevel.MANAGE) {
                throw new BadRequestException("Access denied");
            }
        }

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

    private ShareInfoDto saveFolderPermission(Folder folder, User currentUser, User sharedWith, AccessLevel accessLevel) {
        FolderPermission permission = folderPermissionRepository.findByFolderIdAndSharedWithId(folder.getId(), sharedWith.getId())
                .orElse(null);

        if (permission != null) {
            permission.setAccessLevel(accessLevel);
        } else {
            permission = FolderPermission.builder()
                    .folder(folder)
                    .sharedBy(currentUser)
                    .sharedWith(sharedWith)
                    .accessLevel(accessLevel)
                    .build();
        }
        permission = folderPermissionRepository.save(permission);

        eventPublisher.publishEvent(new FolderSharedEvent(
                this, folder.getId(), folder.getName(), currentUser.getId(), currentUser.getName(),
                sharedWith.getId(), accessLevel.name()));

        log.info("Folder shared: {} -> {} ({}) by {}", folder.getName(), sharedWith.getEmail(),
                accessLevel, currentUser.getEmail());

        return ShareInfoDto.builder()
                .permissionId(permission.getId())
                .userId(sharedWith.getId())
                .userName(sharedWith.getName())
                .userEmail(sharedWith.getEmail())
                .userAvatar(sharedWith.getAvatarUrl())
                .accessLevel(accessLevel.name())
                .sharedById(currentUser.getId())
                .sharedByName(currentUser.getName())
                .sharedAt(permission.getCreatedAt())
                .build();
    }
}
