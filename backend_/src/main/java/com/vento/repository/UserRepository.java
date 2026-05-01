package com.vento.repository;

import com.vento.model.User;
import com.vento.model.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByTeamId(Long teamId);
    List<User> findByTeam_Manager_Id(Long managerId);
    List<User> findByRoleAndTeamIsNull(Role role);
    List<User> findByTeam_Manager_IdAndRole(Long managerId, Role role);
    long countByActive(boolean active);

    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<User> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findAllOrderByCreatedAtDesc();
}
