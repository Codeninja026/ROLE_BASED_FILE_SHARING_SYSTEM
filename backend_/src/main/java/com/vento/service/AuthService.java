package com.vento.service;

import com.vento.dto.*;
import com.vento.exception.*;
import com.vento.model.*;
import com.vento.repository.*;
import com.vento.security.JwtTokenProvider;
import com.vento.security.RateLimiter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserSettingsRepository settingsRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RateLimiter rateLimiter;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       UserSettingsRepository settingsRepository, ActivityLogRepository activityLogRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider, RateLimiter rateLimiter) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.rateLimiter = rateLimiter;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String key = request.getEmail().toLowerCase();

        if (rateLimiter.isRateLimited(key)) {
            throw new RateLimitException("Too many login attempts. Please try again later.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.generateToken(authentication);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            rateLimiter.resetAttempts(key);

            log.info("User logged in: {}", user.getEmail());

            activityLogRepository.save(ActivityLog.builder()
                    .userId(user.getId())
                    .userName(user.getName())
                    .action("login")
                    .targetType("auth")
                    .targetName(user.getEmail())
                    .details("User logged in successfully")
                    .build());

            return AuthResponse.builder()
                    .token(token)
                    .user(UserDto.from(user))
                    .build();

        } catch (BadCredentialsException ex) {
            rateLimiter.recordAttempt(key);
            log.warn("Failed login attempt for: {}", request.getEmail());
            throw ex;
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        Role role = Role.ROLE_USER;
        if (request.getRole() != null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (isAdmin) {
                role = parseRequestedRole(request.getRole());
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .provider(AuthProvider.LOCAL)
                .avatarUrl("https://api.dicebear.com/7.x/initials/svg?seed=" + request.getName().replace(" ", "+"))
                .build();

        user = userRepository.save(user);

        settingsRepository.save(UserSettings.builder()
                .user(user)
                .theme("dark")
                .emailNotifications(true)
                .pushNotifications(false)
                .sessionTimeout(30)
                .build());

        String token = tokenProvider.generateToken(user.getEmail());

        log.info("New user registered: {} [{}]", user.getEmail(), user.getRole());

        activityLogRepository.save(ActivityLog.builder()
                .userId(user.getId())
                .userName(user.getName())
                .action("register")
                .targetType("auth")
                .targetName(user.getEmail())
                .details("User registered with role: " + user.getRole())
                .build());

        return AuthResponse.builder()
                .token(token)
                .user(UserDto.from(user))
                .build();
    }

    @Transactional
    public AuthResponse googleLogin(String googleId, String email, String name, String avatarUrl) {
        // 1. Try to find by Google ID
        User user = userRepository.findByGoogleId(googleId).orElse(null);

        if (user == null) {
            // 2. Try to find by Email (linking local account to Google)
            user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                user.setGoogleId(googleId);
                user.setProvider(AuthProvider.GOOGLE);
                if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
                log.info("Linked local account to Google identity: {}", email);
            } else {
                // 3. Optional: Auto-create if from a trusted domain? 
                // For now, adhere to Admin-managed policy but allow gmail if it's a new enterprise user
                log.warn("Unauthorized Google login attempt: {}", email);
                throw new BadRequestException("No enterprise account found for this Google identity. Please contact your administrator.");
            }
        }

        if (!user.isActive()) {
            throw new BadRequestException("Account reached but is deactivated. Secure access denied.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());

        log.info("Successful SSO login: {} [{}]", user.getEmail(), user.getRole());

        activityLogRepository.save(ActivityLog.builder()
                .userId(user.getId())
                .userName(user.getName())
                .action("google_login")
                .targetType("auth")
                .targetName(user.getEmail())
                .details("Successful Google Sign-In")
                .build());

        return AuthResponse.builder()
                .token(token)
                .user(UserDto.from(user))
                .build();
    }

    public UserDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserDto.from(user);
    }

    public User getCurrentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Role parseRequestedRole(String requestedRole) {
        if (requestedRole == null) {
            return Role.ROLE_USER;
        }

        return switch (requestedRole.trim().toLowerCase()) {
            case "admin" -> Role.ROLE_ADMIN;
            case "manager" -> Role.ROLE_MANAGER;
            default -> Role.ROLE_USER;
        };
    }
}
