package com.vento.repository;

import com.vento.model.RequestTrace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestTraceRepository extends JpaRepository<RequestTrace, Long> {
}
