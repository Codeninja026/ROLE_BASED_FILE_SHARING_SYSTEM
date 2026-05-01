package com.vento.controller;

import com.vento.dto.*;
import com.vento.model.User;
import com.vento.service.AuthService;
import com.vento.service.FolderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;
    private final AuthService authService;

    public FolderController(FolderService folderService, AuthService authService) {
        this.folderService = folderService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FolderDto>> createFolder(@RequestBody Map<String, Object> body) {
        User user = authService.getCurrentUserEntity();
        String name = (String) body.get("name");
        Long parentId = body.get("parentId") != null ? Long.valueOf(body.get("parentId").toString()) : null;
        FolderDto result = folderService.createFolder(name, parentId, user);
        return ResponseEntity.ok(ApiResponse.ok("Folder created", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FolderDto>>> getRootFolders() {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(ApiResponse.ok(folderService.getRootFolders(user)));
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<ApiResponse<List<FolderDto>>> getSubFolders(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(folderService.getSubFolders(id)));
    }

    @GetMapping("/{id}/files")
    public ResponseEntity<ApiResponse<List<FileDto>>> getFolderFiles(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(folderService.getFolderFiles(id)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderDto>> renameFolder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUserEntity();
        FolderDto result = folderService.renameFolder(id, body.get("name"), user);
        return ResponseEntity.ok(ApiResponse.ok("Folder renamed", result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        folderService.deleteFolder(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Folder deleted"));
    }
}
