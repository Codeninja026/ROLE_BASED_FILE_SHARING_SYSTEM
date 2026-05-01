package com.vento.repository;

import com.vento.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerIdAndParentIsNullAndDeletedFalse(Long ownerId);
    List<Folder> findByParentIdAndDeletedFalse(Long parentId);
    List<Folder> findByOwnerIdAndParentIdAndDeletedFalse(Long ownerId, Long parentId);
    List<Folder> findByOwnerIdAndDeletedFalse(Long ownerId);
    List<Folder> findByParentId(Long parentId);
    long countByOwnerIdAndDeletedFalse(Long ownerId);
    long countByDeletedFalse();
    
    java.util.Optional<com.vento.model.Folder> findByNameAndParentAndOwner(String name, com.vento.model.Folder parent, com.vento.model.User owner);
    java.util.Optional<com.vento.model.Folder> findByNameAndParentIsNullAndOwner(String name, com.vento.model.User owner);

    @Query("SELECT f FROM Folder f WHERE f.owner.id = :ownerId AND f.starred = true AND f.deleted = false ORDER BY f.createdAt DESC")
    List<Folder> findByOwnerIdAndStarredTrueAndDeletedFalseOrderByCreatedAtDesc(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(f) FROM Folder f WHERE f.starred = true AND f.deleted = false")
    long countStarred();

    @Query("SELECT COUNT(f) FROM Folder f WHERE f.owner.id = :ownerId AND f.starred = true AND f.deleted = false")
    long countStarredByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(f) FROM Folder f WHERE f.deleted = false AND (f.owner.id = :managerId OR f.owner.team.manager.id = :managerId) AND f.starred = true")
    long countStarredByManagerScope(@Param("managerId") Long managerId);

    List<Folder> findByStarredTrueAndDeletedFalseOrderByCreatedAtDesc();

    @Query("SELECT f FROM Folder f WHERE f.deleted = false AND (f.owner.id = :managerId OR f.owner.team.manager.id = :managerId) AND f.starred = true ORDER BY f.createdAt DESC")
    List<Folder> findStarredByManagerScope(@Param("managerId") Long managerId);
}
