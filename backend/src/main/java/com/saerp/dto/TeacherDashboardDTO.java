package com.saerp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherDashboardDTO {
    private Long assignedScripts;
    private Long evaluatedScripts;
    private Long pendingScripts;
    private Double evaluationPercentage;
}
