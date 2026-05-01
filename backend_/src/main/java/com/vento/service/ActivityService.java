package com.vento.service;

import com.vento.dto.*;
import com.vento.model.Role;
import com.vento.model.User;
import com.vento.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public ActivityService(ActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    public List<ActivityLogDto> getRecentActivities(User currentUser) {
        return getScopedActivities(currentUser)
                .stream().map(ActivityLogDto::from).collect(Collectors.toList());
    }

    public List<ActivityLogDto> getUserActivities(Long userId) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(ActivityLogDto::from).collect(Collectors.toList());
    }

    public Page<ActivityLogDto> search(String query, Pageable pageable) {
        return activityLogRepository.search(query, pageable).map(ActivityLogDto::from);
    }

    public List<ActivityLogDto> getByAction(String action, User currentUser) {
        return getScopedActivitiesByAction(action, currentUser)
                .stream().map(ActivityLogDto::from).collect(Collectors.toList());
    }

    private List<com.vento.model.ActivityLog> getScopedActivities(User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return activityLogRepository.findTop50ByOrderByCreatedAtDesc();
        }
        if (currentUser.getRole() == Role.ROLE_MANAGER) {
            List<Long> userIds = getManagerScopeUserIds(currentUser.getId());
            if (userIds.isEmpty()) {
                return Collections.emptyList();
            }
            return activityLogRepository.findByUserIdsOrderByCreatedAtDesc(userIds).stream()
                    .limit(50)
                    .collect(Collectors.toList());
        }
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
    }

    private List<com.vento.model.ActivityLog> getScopedActivitiesByAction(String action, User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return activityLogRepository.findByAction(action);
        }
        if (currentUser.getRole() == Role.ROLE_MANAGER) {
            List<Long> userIds = getManagerScopeUserIds(currentUser.getId());
            if (userIds.isEmpty()) {
                return Collections.emptyList();
            }
            return activityLogRepository.findByUserIdsAndAction(userIds, action);
        }
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .filter(activity -> action.equalsIgnoreCase(activity.getAction()))
                .collect(Collectors.toList());
    }

    private List<Long> getManagerScopeUserIds(Long managerId) {
        return userRepository.findByTeam_Manager_Id(managerId).stream()
                .map(User::getId)
                .collect(Collectors.collectingAndThen(Collectors.toList(), ids -> {
                    ids.add(managerId);
                    return ids;
                }));
    }
}
