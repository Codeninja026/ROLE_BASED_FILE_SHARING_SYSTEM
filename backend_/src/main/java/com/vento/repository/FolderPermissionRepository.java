package com.vento.repository;

import com.vento.model.FolderPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderPermissionRepository extends JpaRepository<FolderPermission, Long> {

    Optional<FolderPermission> findByFolderIdAndSharedWithId(Long folderId, Long sharedWithId);

    List<FolderPermission> findByFolderId(Long folderId);

    @Query("SELECT fp FROM FolderPermission fp JOIN FETCH fp.folder f WHERE fp.sharedWith.id = :userId AND f.deleted = false")
    List<FolderPermission> findSharedWithUser(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM FolderPermission fp WHERE fp.folder.id = :folderId AND fp.sharedWith.id = :userId")
    void deleteByFolderIdAndSharedWithId(@Param("folderId") Long folderId, @Param("userId") Long userId);

    @Query("SELECT COUNT(fp) FROM FolderPermission fp")
    long countSharedFolders();

    long countBySharedWithId(Long userId);
}
