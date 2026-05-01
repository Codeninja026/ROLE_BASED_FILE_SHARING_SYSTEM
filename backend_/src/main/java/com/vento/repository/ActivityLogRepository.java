package com.vento.repository;

import com.vento.model.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findTop50ByOrderByCreatedAtDesc();

    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT a FROM ActivityLog a WHERE " +
           "LOWER(a.userName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(a.targetName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(a.action) LIKE LOWER(CONCAT('%',:q,'%')) " +
           "ORDER BY a.createdAt DESC")
    Page<ActivityLog> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT a FROM ActivityLog a WHERE a.action = :action ORDER BY a.createdAt DESC")
    List<ActivityLog> findByAction(@Param("action") String action);

    List<ActivityLog> findTop10ByOrderByCreatedAtDesc();

    List<ActivityLog> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT a FROM ActivityLog a WHERE a.userId IN :userIds ORDER BY a.createdAt DESC")
    List<ActivityLog> findByUserIdsOrderByCreatedAtDesc(@Param("userIds") List<Long> userIds);

    @Query("SELECT a FROM ActivityLog a WHERE a.userId IN :userIds AND a.action = :action ORDER BY a.createdAt DESC")
    List<ActivityLog> findByUserIdsAndAction(@Param("userIds") List<Long> userIds, @Param("action") String action);

}
