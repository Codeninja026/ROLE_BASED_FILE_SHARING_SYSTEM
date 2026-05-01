package com.vento.repository;

import com.vento.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByManagerIdOrderByCreatedAtAsc(Long managerId);
    Optional<Team> findByNameIgnoreCase(String name);
}
