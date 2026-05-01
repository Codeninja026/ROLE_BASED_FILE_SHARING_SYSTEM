package com.vento.controller;

import com.vento.dto.*;
import com.vento.model.User;
import com.vento.service.AuthService;
import com.vento.service.ShareService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shares")
public class ShareController {

    private final ShareService shareService;
    private final AuthService authService;

    public ShareController(ShareService shareService, AuthService authService) {
        this.shareService = shareService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<ShareInfoDto>>> shareFile(@Valid @RequestBody ShareRequest request) {
        User user = authService.getCurrentUserEntity();
        List<ShareInfoDto> result = shareService.shareItem(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Shared successfully", result));
    }

    @DeleteMapping("/{fileId}/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> revokeAccess(@PathVariable Long fileId, @PathVariable Long userId) {
        User user = authService.getCurrentUserEntity();
        shareService.revokeAccess(fileId, userId, user);
        return ResponseEntity.ok(ApiResponse.ok("Access revoked"));
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<ApiResponse<List<ShareInfoDto>>> getPermissions(@PathVariable Long fileId) {
        User user = authService.getCurrentUserEntity();
        List<ShareInfoDto> permissions = shareService.getFilePermissions(fileId, user);
        return ResponseEntity.ok(ApiResponse.ok(permissions));
    }

    @DeleteMapping("/folders/{folderId}/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> revokeFolderAccess(@PathVariable Long folderId, @PathVariable Long userId) {
        User user = authService.getCurrentUserEntity();
        shareService.revokeFolderAccess(folderId, userId, user);
        return ResponseEntity.ok(ApiResponse.ok("Access revoked"));
    }

    @GetMapping("/folders/{folderId}")
    public ResponseEntity<ApiResponse<List<ShareInfoDto>>> getFolderPermissions(@PathVariable Long folderId) {
        User user = authService.getCurrentUserEntity();
        List<ShareInfoDto> permissions = shareService.getFolderPermissions(folderId, user);
        return ResponseEntity.ok(ApiResponse.ok(permissions));
    }
}
