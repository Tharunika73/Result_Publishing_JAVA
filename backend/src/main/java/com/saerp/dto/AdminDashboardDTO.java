package com.saerp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardDTO {
    private Long totalStudents;
    private Long totalTeachers;
    private Long papersAssigned;
    private Long papersEvaluated;
    private Long pendingEvaluations;
    private Double completionPercentage;
}
