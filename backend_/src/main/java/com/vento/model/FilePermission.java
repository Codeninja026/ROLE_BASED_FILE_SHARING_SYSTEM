package com.vento.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_permissions", indexes = {
    @Index(name = "idx_perm_file", columnList = "file_id"),
    @Index(name = "idx_perm_shared_with", columnList = "shared_with_id"),
    @Index(name = "idx_perm_shared_by", columnList = "shared_by_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_file_user", columnNames = {"file_id", "shared_with_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FilePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private FileEntity file;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_by_id", nullable = false)
    private User sharedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_id", nullable = false)
    private User sharedWith;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessLevel accessLevel;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
