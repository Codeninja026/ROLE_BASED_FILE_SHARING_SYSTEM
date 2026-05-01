package com.vento.storage;

import com.vento.exception.BadRequestException;
import com.vento.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path rootLocation;

    public LocalStorageService(@Value("${app.storage.upload-dir}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    @Override
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Storage initialized at: {}", rootLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not initialize storage directory", ex);
        }
    }

    @Override
    public String store(MultipartFile file, Long userId, Long folderId) {
        String rawFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed";
        // Normalize separators
        String cleanName = rawFilename.replace("\\", "/");
        // Extract only the base name (strip any directory path)
        String originalFilename = cleanName;
        if (cleanName.contains("/")) {
            originalFilename = cleanName.substring(cleanName.lastIndexOf("/") + 1);
        }

        // Security: prevent path traversal (check remaining name)
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BadRequestException("Invalid filename: " + originalFilename);
        }

        // Generate unique stored name
        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            extension = originalFilename.substring(dotIdx);
        }
        String storedName = UUID.randomUUID().toString() + extension;

        // Build storage path: uploads/{userId}/{folderId}/
        String folderPath = userId.toString();
        if (folderId != null) {
            folderPath += "/" + folderId;
        }

        try {
            Path targetDir = rootLocation.resolve(folderPath).normalize();

            // Additional security check: ensure resolved path is within rootLocation
            if (!targetDir.startsWith(rootLocation)) {
                throw new BadRequestException("Cannot store file outside designated directory");
            }

            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(storedName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Return relative path from root
            String relativePath = rootLocation.relativize(targetPath).toString();
            log.info("Stored file: {} -> {}", originalFilename, relativePath);
            return relativePath;

        } catch (IOException ex) {
            log.error("Failed to store file: {}", originalFilename, ex);
            throw new RuntimeException("Failed to store file: " + originalFilename, ex);
        }
    }

    @Override
    public Resource loadAsResource(String filePath) {
        try {
            // Security: prevent path traversal
            Path resolvedPath = rootLocation.resolve(filePath).normalize();
            if (!resolvedPath.startsWith(rootLocation)) {
                throw new BadRequestException("Access denied: path traversal detected");
            }

            Resource resource = new UrlResource(resolvedPath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + filePath);
        }
    }

    @Override
    public boolean delete(String filePath) {
        try {
            Path resolvedPath = rootLocation.resolve(filePath).normalize();
            if (!resolvedPath.startsWith(rootLocation)) {
                throw new BadRequestException("Access denied: path traversal detected");
            }
            boolean deleted = Files.deleteIfExists(resolvedPath);
            if (deleted) {
                log.info("Deleted file: {}", filePath);
            }
            return deleted;
        } catch (IOException ex) {
            log.error("Failed to delete file: {}", filePath, ex);
            return false;
        }
    }
}
