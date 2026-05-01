package com.vento.service;

import com.vento.dto.TeamDto;
import com.vento.dto.UserDto;
import com.vento.exception.BadRequestException;
import com.vento.exception.ResourceNotFoundException;
import com.vento.model.Role;
import com.vento.model.Team;
import com.vento.model.User;
import com.vento.repository.TeamRepository;
import com.vento.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TeamDto> getTeams(User currentUser) {
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return teamRepository.findAll().stream()
                    .sorted((left, right) -> left.getCreatedAt().compareTo(right.getCreatedAt()))
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        ensureManagerOrAdmin(currentUser);
        return teamRepository.findByManagerIdOrderByCreatedAtAsc(currentUser.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamDto getTeam(Long teamId, User currentUser) {
        Team team = getManagedTeamEntity(teamId, currentUser);
        return toDto(team);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAssignableUsers(User currentUser, String query) {
        ensureManagerOrAdmin(currentUser);

        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);

        return userRepository.findByRoleAndTeamIsNull(Role.ROLE_USER)
                .stream()
                .filter(user -> normalizedQuery.isBlank()
                        || user.getName().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                        || user.getEmail().toLowerCase(Locale.ROOT).contains(normalizedQuery))
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamDto createTeam(String name, Long managerId, User currentUser) {
        User manager = resolveManager(managerId, currentUser);

        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Team name is required");
        }

        String normalizedName = name.trim();
        teamRepository.findByNameIgnoreCase(normalizedName)
                .filter(existing -> !existing.getManager().getId().equals(manager.getId()))
                .ifPresent(existing -> {
                    throw new BadRequestException("A team with this name already exists");
                });

        Team team = teamRepository.save(Team.builder()
                .manager(manager)
                .name(normalizedName)
                .build());

        return toDto(team);
    }

    @Transactional
    public TeamDto updateTeam(Long teamId, String name, Long managerId, User currentUser) {
        Team team = getManagedTeamEntity(teamId, currentUser);

        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Team name is required");
        }

        String normalizedName = name.trim();
        teamRepository.findByNameIgnoreCase(normalizedName)
                .filter(existing -> !existing.getId().equals(teamId))
                .ifPresent(existing -> {
                    throw new BadRequestException("A team with this name already exists");
                });

        team.setName(normalizedName);
        if (managerId != null && currentUser.getRole() == Role.ROLE_ADMIN) {
            team.setManager(resolveManager(managerId, currentUser));
        }

        team = teamRepository.save(team);
        return toDto(team);
    }

    @Transactional
    public TeamDto assignMember(Long teamId, Long userId, User currentUser) {
        Team team = getManagedTeamEntity(teamId, currentUser);

        User member = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (member.getRole() != Role.ROLE_USER) {
            throw new BadRequestException("Only users can be assigned to a team");
        }

        member.setTeam(team);
        userRepository.save(member);

        return toDto(team);
    }

    @Transactional
    public TeamDto removeMember(Long teamId, Long userId, User currentUser) {
        Team team = getManagedTeamEntity(teamId, currentUser);

        User member = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (member.getTeam() == null || !member.getTeam().getId().equals(team.getId())) {
            throw new BadRequestException("This user is not part of your team");
        }

        member.setTeam(null);
        userRepository.save(member);

        return toDto(team);
    }

    @Transactional(readOnly = true)
    public Team getManagedTeamEntity(Long teamId, User currentUser) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return team;
        }

        ensureManagerOrAdmin(currentUser);
        if (!team.getManager().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can manage only your own teams");
        }
        return team;
    }

    private TeamDto toDto(Team team) {
        List<UserDto> members = userRepository.findByTeamId(team.getId())
                .stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
        return TeamDto.from(team, members);
    }

    private void ensureManagerOrAdmin(User currentUser) {
        if (currentUser.getRole() != Role.ROLE_MANAGER && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Only managers or admins can manage teams");
        }
    }

    private User resolveManager(Long managerId, User currentUser) {
        ensureManagerOrAdmin(currentUser);

        if (currentUser.getRole() == Role.ROLE_MANAGER) {
            return currentUser;
        }

        if (managerId == null) {
            throw new BadRequestException("Manager is required");
        }

        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        if (manager.getRole() != Role.ROLE_MANAGER && manager.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Selected user is not a manager");
        }

        return manager;
    }
}
