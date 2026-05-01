package com.vento.service;

import com.vento.dto.UserDto;
import com.vento.exception.*;
import com.vento.model.*;
import com.vento.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserSettingsRepository settingsRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserSettingsRepository settingsRepository,
                       ActivityLogRepository activityLogRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAllOrderByCreatedAtDesc().stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    public List<UserDto> getManageableUsers(User currentUser, String query) {
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);

        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return userRepository.findAllOrderByCreatedAtDesc().stream()
                    .filter(user -> user.getRole() != Role.ROLE_ADMIN)
                    .filter(user -> normalizedQuery.isBlank()
                            || user.getName().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                            || user.getEmail().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                            || (user.getTeam() != null && user.getTeam().getName().toLowerCase(Locale.ROOT).contains(normalizedQuery)))
                    .map(UserDto::from)
                    .collect(Collectors.toList());
        }

        if (currentUser.getRole() != Role.ROLE_MANAGER) {
            throw new BadRequestException("Only managers or admins can access manageable users");
        }

        return userRepository.findByTeam_Manager_IdAndRole(currentUser.getId(), Role.ROLE_USER).stream()
                .filter(user -> normalizedQuery.isBlank()
                        || user.getName().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                        || user.getEmail().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                        || (user.getTeam() != null && user.getTeam().getName().toLowerCase(Locale.ROOT).contains(normalizedQuery)))
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return UserDto.from(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    @Transactional
    public UserDto updateUser(Long id, Map<String, Object> updates, User currentUser) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only admin or self can update
        if (!currentUser.getRole().equals(Role.ROLE_ADMIN) && !currentUser.getId().equals(id)) {
            throw new BadRequestException("Access denied");
        }

        if (updates.containsKey("name")) {
            target.setName((String) updates.get("name"));
        }
        if (updates.containsKey("active")) {
            if (!currentUser.getRole().equals(Role.ROLE_ADMIN)) {
                throw new BadRequestException("Only admins can change user status");
            }
            target.setActive((boolean) updates.get("active"));
        }
        if (updates.containsKey("role")) {
            if (!currentUser.getRole().equals(Role.ROLE_ADMIN)) {
                throw new BadRequestException("Only admins can change user roles");
            }
            String roleStr = (String) updates.get("role");
            target.setRole(parseRole(roleStr));
        }

        target = userRepository.save(target);

        activityLogRepository.save(ActivityLog.builder()
                .userId(currentUser.getId())
                .userName(currentUser.getName())
                .action("user_update")
                .targetType("user")
                .targetName(target.getName())
                .targetId(target.getId())
                .details("Updated user: " + updates.keySet())
                .build());

        log.info("User updated: {} by {}", target.getEmail(), currentUser.getEmail());
        return UserDto.from(target);
    }

    @Transactional
    public void deleteUser(Long id, User currentUser) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (target.getId().equals(currentUser.getId())) {
            throw new BadRequestException("Cannot delete your own account");
        }
        if (!currentUser.getRole().equals(Role.ROLE_ADMIN)) {
            throw new BadRequestException("Only admins can delete users");
        }

        activityLogRepository.save(ActivityLog.builder()
                .userId(currentUser.getId())
                .userName(currentUser.getName())
                .action("user_delete")
                .targetType("user")
                .targetName(target.getName())
                .targetId(target.getId())
                .details("User deleted: " + target.getEmail())
                .build());

        userRepository.delete(target);
        log.info("User deleted: {} by {}", target.getEmail(), currentUser.getEmail());
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for: {}", user.getEmail());
    }

    @Transactional
    public UserDto updateProfile(Long userId, String name) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setName(name);
        user = userRepository.save(user);
        log.info("Profile updated for: {}", user.getEmail());
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateAvatarUrl(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setAvatarUrl(avatarUrl);
        user = userRepository.save(user);
        log.info("Avatar updated for: {}", user.getEmail());
        return UserDto.from(user);
    }

    private Role parseRole(String roleStr) {
        if (roleStr == null) {
            return Role.ROLE_USER;
        }

        return switch (roleStr.trim().toLowerCase()) {
            case "admin" -> Role.ROLE_ADMIN;
            case "manager" -> Role.ROLE_MANAGER;
            default -> Role.ROLE_USER;
        };
    }
}
