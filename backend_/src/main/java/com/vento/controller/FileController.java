package com.vento.controller;

import com.vento.dto.*;
import com.vento.model.User;
import com.vento.service.AuthService;
import com.vento.service.FileService;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final AuthService authService;

    public FileController(FileService fileService, AuthService authService) {
        this.fileService = fileService;
        this.authService = authService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileDto>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestParam(value = "path", required = false) String path) {
        User user = authService.getCurrentUserEntity();
        FileDto result = fileService.uploadFile(file, folderId, user, path);
        return ResponseEntity.ok(ApiResponse.ok("File uploaded successfully", result));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        Resource resource = fileService.downloadFile(id, user);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FileDto>>> getFiles() {
        User user = authService.getCurrentUserEntity();
        List<FileDto> files = fileService.getUserFiles(user);
        return ResponseEntity.ok(ApiResponse.ok(files));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<FileDto>>> getAllFiles() {
        User user = authService.getCurrentUserEntity();
        List<FileDto> files = fileService.getAllFiles(user);
        return ResponseEntity.ok(ApiResponse.ok(files));
    }

    @GetMapping("/shared")
    public ResponseEntity<ApiResponse<List<FileDto>>> getSharedFiles() {
        User user = authService.getCurrentUserEntity();
        List<FileDto> files = fileService.getSharedWithMe(user);
        return ResponseEntity.ok(ApiResponse.ok(files));
    }

    @GetMapping("/folders/shared")
    public ResponseEntity<ApiResponse<List<FolderDto>>> getSharedFolders() {
        User user = authService.getCurrentUserEntity();
        List<FolderDto> folders = fileService.getSharedFoldersWithMe(user);
        return ResponseEntity.ok(ApiResponse.ok(folders));
    }

    @GetMapping("/starred")
    public ResponseEntity<ApiResponse<FolderContentDto>> getStarredFiles() {
        User user = authService.getCurrentUserEntity();
        FolderContentDto content = fileService.getStarred(user);
        return ResponseEntity.ok(ApiResponse.ok(content));
    }

    @GetMapping("/trash")
    public ResponseEntity<ApiResponse<List<FileDto>>> getTrash() {
        User user = authService.getCurrentUserEntity();
        List<FileDto> files = fileService.getTrash(user);
        return ResponseEntity.ok(ApiResponse.ok(files));
    }

    @PatchMapping("/{id}/star")
    public ResponseEntity<ApiResponse<FileDto>> toggleStar(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        FileDto result = fileService.toggleStar(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Star toggled", result));
    }

    @PatchMapping("/{id}/rename")
    public ResponseEntity<ApiResponse<FileDto>> renameFile(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUserEntity();
        FileDto result = fileService.renameFile(id, body.get("name"), user);
        return ResponseEntity.ok(ApiResponse.ok("File renamed", result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<FileDto>> softDelete(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        FileDto result = fileService.softDelete(id, user);
        return ResponseEntity.ok(ApiResponse.ok("File moved to trash", result));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<FileDto>> restoreFile(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        FileDto result = fileService.restoreFile(id, user);
        return ResponseEntity.ok(ApiResponse.ok("File restored", result));
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<ApiResponse<Void>> permanentDelete(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        fileService.permanentDelete(id, user);
        return ResponseEntity.ok(ApiResponse.ok("File permanently deleted"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<FileDto>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String dir) {
        User user = authService.getCurrentUserEntity();
        Sort s = Sort.by(dir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sort);
        Page<FileDto> results = fileService.search(q, user, PageRequest.of(page, size, s));
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/browse")
    public ResponseEntity<ApiResponse<FolderContentDto>> browse(
            @RequestParam(required = false) Long folderId) {
        User user = authService.getCurrentUserEntity();
        FolderContentDto contents = fileService.getFolderContents(folderId, user);
        return ResponseEntity.ok(ApiResponse.ok(contents));
    }

    @PostMapping("/folders")
    public ResponseEntity<ApiResponse<FolderDto>> createFolder(
            @RequestBody Map<String, Object> body) {
        User user = authService.getCurrentUserEntity();
        String name = (String) body.get("name");
        Long parentId = body.get("parentId") != null ? Long.valueOf(body.get("parentId").toString()) : null;
        FolderDto result = fileService.createFolder(name, parentId, user);
        return ResponseEntity.ok(ApiResponse.ok("Folder created successfully", result));
    }

    @DeleteMapping("/folders/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeleteFolder(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        fileService.softDeleteFolder(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Folder moved to trash"));
    }

    @PatchMapping("/folders/{id}/star")
    public ResponseEntity<ApiResponse<FolderDto>> toggleFolderStar(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        FolderDto result = fileService.toggleFolderStar(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Folder star toggled", result));
    }

    @PatchMapping("/folders/{id}/rename")
    public ResponseEntity<ApiResponse<FolderDto>> renameFolder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUserEntity();
        FolderDto result = fileService.renameFolder(id, body.get("name"), user);
        return ResponseEntity.ok(ApiResponse.ok("Folder renamed", result));
    }

    @GetMapping("/folders/download/{id}")
    public void downloadFolder(@PathVariable Long id, jakarta.servlet.http.HttpServletResponse response) {
        User user = authService.getCurrentUserEntity();
        // Set headers for ZIP download
        response.setContentType("application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=\"folder.zip\"");
        try {
            fileService.downloadFolderAsZip(id, user, response.getOutputStream());
        } catch (Exception e) {
            throw new com.vento.exception.BadRequestException("Failed to download folder: " + e.getMessage());
        }
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics() {
        User user = authService.getCurrentUserEntity();
        Map<String, Object> metrics = fileService.getMetrics(user);
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }
}
