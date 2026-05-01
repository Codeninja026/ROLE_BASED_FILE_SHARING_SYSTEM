package com.vento.dto;

import com.vento.model.Team;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamDto {
    private Long id;
    private String name;
    private Long managerId;
    private String managerName;
    private List<UserDto> members;
    private int memberCount;
    private LocalDateTime createdAt;

    public static TeamDto from(Team team, List<UserDto> members) {
        return TeamDto.builder()
                .id(team.getId())
                .name(team.getName())
                .managerId(team.getManager().getId())
                .managerName(team.getManager().getName())
                .members(members)
                .memberCount(members != null ? members.size() : 0)
                .createdAt(team.getCreatedAt())
                .build();
    }
}
