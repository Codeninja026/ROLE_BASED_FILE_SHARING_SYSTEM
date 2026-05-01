package com.vento.controller;

import com.vento.dto.*;
import com.vento.model.User;
import com.vento.service.AuthService;
import com.vento.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    // Base URL for serving avatar images
    private static final String AVATAR_DIR = "uploads/avatars/";

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @GetMapping("/manageable")
    public ResponseEntity<ApiResponse<List<UserDto>>> getManageableUsers(@RequestParam(required = false) String q) {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(ApiResponse.ok(userService.getManageableUsers(currentUser, q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.username")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        User currentUser = authService.getCurrentUserEntity();
        UserDto result = userService.updateUser(id, updates, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("User updated", result));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        User currentUser = authService.getCurrentUserEntity();
        userService.deleteUser(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("User deleted"));
    }

    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@RequestBody Map<String, String> body) {
        User currentUser = authService.getCurrentUserEntity();
        UserDto result = userService.updateProfile(currentUser.getId(), body.get("name"));
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", result));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody PasswordChangeRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        userService.changePassword(currentUser.getId(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }

    /**
     * Upload profile picture. Stores image in uploads/avatars/ and returns public URL.
     */
    @PostMapping("/profile-picture")
    public ResponseEntity<ApiResponse<UserDto>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file) throws IOException {

        User currentUser = authService.getCurrentUserEntity();

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only image files are allowed"));
        }

        // Determine extension more robustly
        String originalFilename = file.getOriginalFilename();
        String extension = ".png"; // Default to png if we can't determine
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else if (contentType != null && contentType.contains("/")) {
            String subType = contentType.split("/")[1];
            extension = "." + (subType.equals("jpeg") ? "jpg" : subType);
        }

        String storedName = "avatar_" + currentUser.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

        // Save to disk
        Path avatarDir = Paths.get(AVATAR_DIR).toAbsolutePath().normalize();
        Files.createDirectories(avatarDir);
        Path target = avatarDir.resolve(storedName);
        file.transferTo(target.toFile());

        // Build a public URL  (served via /api/avatars/** static mapping)
        String avatarUrl = "/api/avatars/" + storedName;

        UserDto result = userService.updateAvatarUrl(currentUser.getId(), avatarUrl);
        return ResponseEntity.ok(ApiResponse.ok("Profile picture updated", result));
    }
}
