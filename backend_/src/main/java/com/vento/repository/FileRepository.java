package com.vento.repository;

import com.vento.model.FileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {

    List<FileEntity> findByOwnerIdAndDeletedFalseOrderByCreatedAtDesc(Long ownerId);

    List<FileEntity> findByOwnerIdAndDeletedTrueOrderByDeletedAtDesc(Long ownerId);

    List<FileEntity> findByDeletedTrueOrderByDeletedAtDesc();

    List<FileEntity> findByOwnerIdAndStarredTrueAndDeletedFalseOrderByCreatedAtDesc(Long ownerId);

    List<FileEntity> findByFolderIdAndDeletedFalseOrderByCreatedAtDesc(Long folderId);
    List<FileEntity> findByFolderId(Long folderId);
    List<FileEntity> findByDeletedFalseOrderByCreatedAtDesc();

    List<FileEntity> findTop8ByOwnerIdAndDeletedFalseOrderByCreatedAtDesc(Long ownerId);

    List<FileEntity> findTop8ByDeletedFalseOrderByCreatedAtDesc();

    @Query("SELECT f FROM FileEntity f WHERE f.deleted = false AND f.owner.team.manager.id = :managerId ORDER BY f.createdAt DESC")
    List<FileEntity> findByManagerTeamFiles(@Param("managerId") Long managerId);

    @Query("SELECT f FROM FileEntity f WHERE f.deleted = false AND (f.owner.id = :managerId OR f.owner.team.manager.id = :managerId) ORDER BY f.createdAt DESC")
    List<FileEntity> findVisibleFilesForManager(@Param("managerId") Long managerId);

    @Query("SELECT f FROM FileEntity f WHERE f.deleted = false AND f.owner.id = :ownerId AND LOWER(f.originalName) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<FileEntity> searchByOwner(@Param("ownerId") Long ownerId, @Param("q") String query, Pageable pageable);

    @Query("SELECT f FROM FileEntity f WHERE f.deleted = false AND LOWER(f.originalName) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<FileEntity> searchAll(@Param("q") String query, Pageable pageable);

    @Query("SELECT f FROM FileEntity f WHERE f.deleted = false AND (f.owner.id = :managerId OR f.owner.team.manager.id = :managerId) AND LOWER(f.originalName) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<FileEntity> searchByManagerScope(@Param("managerId") Long managerId, @Param("q") String query, Pageable pageable);

    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.owner.id = :ownerId AND f.deleted = false")
    long countByOwnerAndNotDeleted(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.deleted = false AND (f.owner.id = :managerId OR f.owner.team.manager.id = :managerId)")
    long countByManagerScope(@Param("managerId") Long managerId);

    @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM FileEntity f WHERE f.owner.id = :ownerId AND f.deleted = false")
    long sumFileSizeByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM FileEntity f WHERE f.deleted = false AND (f.owner.id = :managerId OR f.owner.team.manager.id = :managerId)")
    long sumFileSizeByManagerScope(@Param("managerId") Long managerId);

    @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM FileEntity f WHERE f.deleted = false")
    long sumTotalFileSize();

    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.deleted = false")
    long countActiveFiles();

    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.starred = true AND f.deleted = false")
    long countStarred();

    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.deleted = true")
    long countTrashed();

    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.deleted = true AND f.owner.id = :ownerId")
    long countTrashedByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.owner.id = :ownerId AND f.starred = true AND f.deleted = false")
    long countStarredByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.deleted = false AND (f.owner.id = :managerId OR f.owner.team.manager.id = :managerId) AND f.starred = true")
    long countStarredByManagerScope(@Param("managerId") Long managerId);

    List<FileEntity> findByStarredTrueAndDeletedFalseOrderByCreatedAtDesc();

    @Query("SELECT f FROM FileEntity f WHERE f.deleted = false AND (f.owner.id = :managerId OR f.owner.team.manager.id = :managerId) AND f.starred = true ORDER BY f.createdAt DESC")
    List<FileEntity> findStarredByManagerScope(@Param("managerId") Long managerId);

    @Query("SELECT f.mimeType, COUNT(f) FROM FileEntity f WHERE f.deleted = false GROUP BY f.mimeType")
    List<Object[]> countByMimeType();

    @Query("SELECT f.mimeType, COUNT(f) FROM FileEntity f WHERE f.deleted = false AND f.owner.id = :ownerId GROUP BY f.mimeType")
    List<Object[]> countByMimeTypeForOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT f.mimeType, COUNT(f) FROM FileEntity f WHERE f.deleted = false AND (f.owner.id = :managerId OR f.owner.team.manager.id = :managerId) GROUP BY f.mimeType")
    List<Object[]> countByMimeTypeForManagerScope(@Param("managerId") Long managerId);

    @Query(value = "SELECT TO_CHAR(f.created_at, 'YYYY-MM') as month, COUNT(f.id), SUM(f.file_size) " +
            "FROM files f WHERE f.deleted = false " +
            "GROUP BY month ORDER BY month DESC LIMIT 6", nativeQuery = true)
    List<Object[]> countByMonth();

    @Query(value = "SELECT TO_CHAR(f.created_at, 'YYYY-MM') as month, COUNT(f.id), SUM(f.file_size) " +
            "FROM files f WHERE f.deleted = false AND f.owner_id = :ownerId " +
            "GROUP BY month ORDER BY month DESC LIMIT 6", nativeQuery = true)
    List<Object[]> countByMonthForOwner(@Param("ownerId") Long ownerId);

    @Query(value = "SELECT TO_CHAR(f.created_at, 'YYYY-MM') as month, COUNT(f.id), SUM(f.file_size) " +
            "FROM files f LEFT JOIN users u ON f.owner_id = u.id " +
            "WHERE f.deleted = false AND (f.owner_id = :managerId OR u.team_id IN (SELECT t.id FROM teams t WHERE t.manager_id = :managerId)) " +
            "GROUP BY month ORDER BY month DESC LIMIT 6", nativeQuery = true)
    List<Object[]> countByMonthForManagerScope(@Param("managerId") Long managerId);
}
