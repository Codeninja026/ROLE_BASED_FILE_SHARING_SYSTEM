package com.vento.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(nullable = false)
    private String theme = "dark";

    @Builder.Default
    @Column(nullable = false)
    private boolean emailNotifications = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean pushNotifications = false;

    @Builder.Default
    @Column(nullable = false)
    private int sessionTimeout = 30;
}
