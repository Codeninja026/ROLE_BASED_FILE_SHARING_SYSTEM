package com.vento.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "request_traces")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RequestTrace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String method;

    private String url;

    @Column(columnDefinition = "TEXT")
    private String requestBody;

    @Column(columnDefinition = "TEXT")
    private String responseBody;

    private int status;

    private String remoteAddr;

    private String userEmail;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
