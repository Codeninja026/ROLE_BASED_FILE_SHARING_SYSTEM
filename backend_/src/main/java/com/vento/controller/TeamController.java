package com.vento.controller;

import com.vento.dto.ApiResponse;
import com.vento.dto.TeamDto;
import com.vento.dto.UserDto;
import com.vento.model.User;
import com.vento.service.AuthService;
import com.vento.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;
    private final AuthService authService;

    public TeamController(TeamService teamService, AuthService authService) {
        this.teamService = teamService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamDto>>> getTeams() {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(ApiResponse.ok(teamService.getTeams(currentUser)));
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<ApiResponse<TeamDto>> getTeam(@PathVariable Long teamId) {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(ApiResponse.ok(teamService.getTeam(teamId, currentUser)));
    }

    @GetMapping("/available-users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAvailableUsers(@RequestParam(required = false) String q) {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(ApiResponse.ok(teamService.getAssignableUsers(currentUser, q)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TeamDto>> createTeam(@RequestBody Map<String, Object> body) {
        User currentUser = authService.getCurrentUserEntity();
        Long managerId = body.get("managerId") != null ? Long.valueOf(body.get("managerId").toString()) : null;
        TeamDto team = teamService.createTeam((String) body.get("name"), managerId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Team created successfully", team));
    }

    @PatchMapping("/{teamId}")
    public ResponseEntity<ApiResponse<TeamDto>> updateTeam(@PathVariable Long teamId, @RequestBody Map<String, Object> body) {
        User currentUser = authService.getCurrentUserEntity();
        Long managerId = body.get("managerId") != null ? Long.valueOf(body.get("managerId").toString()) : null;
        TeamDto team = teamService.updateTeam(teamId, (String) body.get("name"), managerId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Team saved successfully", team));
    }

    @PostMapping("/{teamId}/members/{userId}")
    public ResponseEntity<ApiResponse<TeamDto>> assignMember(@PathVariable Long teamId, @PathVariable Long userId) {
        User currentUser = authService.getCurrentUserEntity();
        TeamDto team = teamService.assignMember(teamId, userId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("User assigned to team", team));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<ApiResponse<TeamDto>> removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        User currentUser = authService.getCurrentUserEntity();
        TeamDto team = teamService.removeMember(teamId, userId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("User removed from team", team));
    }
}
