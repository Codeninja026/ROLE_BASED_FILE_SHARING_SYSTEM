package com.vento.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, Long userId, Long folderId);
    Resource loadAsResource(String filePath);
    boolean delete(String filePath);
    void init();
}
