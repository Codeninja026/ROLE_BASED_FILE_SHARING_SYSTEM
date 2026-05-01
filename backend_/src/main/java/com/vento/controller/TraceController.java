package com.vento.controller;

import com.vento.dto.ApiResponse;
import com.vento.model.RequestTrace;
import com.vento.repository.RequestTraceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/traces")
@PreAuthorize("hasRole('ADMIN')")
public class TraceController {

    private final RequestTraceRepository requestTraceRepository;

    public TraceController(RequestTraceRepository requestTraceRepository) {
        this.requestTraceRepository = requestTraceRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RequestTrace>>> getTraces(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<RequestTrace> traces = requestTraceRepository.findAll(
                PageRequest.of(page, size, Sort.by("timestamp").descending())
        );
        return ResponseEntity.ok(ApiResponse.ok(traces));
    }
}
