package com.vento.config;

import com.vento.model.*;
import com.vento.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final UserSettingsRepository settingsRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, UserSettingsRepository settingsRepository,
                     ActivityLogRepository activityLogRepository, NotificationRepository notificationRepository,
                     PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("=== Checking role based file sharing system database seeding ===");

        String adminPassword = passwordEncoder.encode("adminadmin");
        String managerPassword = passwordEncoder.encode("manager123");
        String userPassword = passwordEncoder.encode("user123");

        // Admins
        ensureUser("System Administrator", "admin@rbfs.local", adminPassword, Role.ROLE_ADMIN);
        ensureUser("Security Administrator", "security@rbfs.local", adminPassword, Role.ROLE_ADMIN);

        // Managers
        ensureUser("Department Manager", "manager@rbfs.local", managerPassword, Role.ROLE_MANAGER);
        ensureUser("Project Coordinator", "coordinator@rbfs.local", managerPassword, Role.ROLE_MANAGER);

        // Demo Users
        ensureUser("Employee One", "user1@rbfs.local", userPassword, Role.ROLE_USER);
        ensureUser("Employee Two", "user2@rbfs.local", userPassword, Role.ROLE_USER);

        log.info("=== Seeding check complete ===");
    }

    private void ensureUser(String name, String email, String password, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .password(password)
                .role(role)
                .active(true)
                .provider(AuthProvider.LOCAL)
                .avatarUrl("https://api.dicebear.com/7.x/initials/svg?seed=" + name.replace(" ", "+"))
                .build();
        
        user = userRepository.save(user);

        // Initial settings
        settingsRepository.save(UserSettings.builder()
                .user(user)
                .theme("dark")
                .emailNotifications(true)
                .pushNotifications(false)
                .sessionTimeout(30)
                .build());
        
        // Initial notification
        notificationRepository.save(Notification.builder()
                .user(user)
                .type("system")
                .message("Welcome to the Role Based File Sharing System. Your account is ready.")
                .isRead(false)
                .build());

        // Initial activity
        activityLogRepository.save(ActivityLog.builder()
                .userId(user.getId())
                .userName(user.getName())
                .action("account_seed")
                .targetType("user")
                .targetName(email)
                .details("System automatically seeded account")
                .build());

        log.info("Seeded user: {} ({})", name, email);
    }
}
