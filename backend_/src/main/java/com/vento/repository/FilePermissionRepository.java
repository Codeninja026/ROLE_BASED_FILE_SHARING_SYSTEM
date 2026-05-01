package com.vento.repository;

import com.vento.model.FilePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FilePermissionRepository extends JpaRepository<FilePermission, Long> {

    List<FilePermission> findByFileId(Long fileId);

    List<FilePermission> findBySharedWithId(Long userId);

    long countBySharedWithId(Long userId);

    @Query("SELECT fp FROM FilePermission fp JOIN FETCH fp.file f WHERE fp.sharedWith.id = :userId AND f.deleted = false ORDER BY fp.createdAt DESC")
    List<FilePermission> findSharedWithUser(@Param("userId") Long userId);

    Optional<FilePermission> findByFileIdAndSharedWithId(Long fileId, Long sharedWithId);

    boolean existsByFileIdAndSharedWithId(Long fileId, Long sharedWithId);

    void deleteByFileIdAndSharedWithId(Long fileId, Long sharedWithId);

    @Query("SELECT COUNT(DISTINCT fp.file.id) FROM FilePermission fp WHERE fp.file.deleted = false")
    long countSharedFiles();

    @Query("SELECT COUNT(DISTINCT fp.file.id) FROM FilePermission fp WHERE fp.sharedBy.id = :userId AND fp.file.deleted = false")
    long countSharedByUser(@Param("userId") Long userId);
}
