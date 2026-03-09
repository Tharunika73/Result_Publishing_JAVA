package com.saerp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherDTO {
    private Long teacherId;
    private String name;
    private String email;
    private String department;
    private Integer papersAssigned;
    private Integer papersEvaluated;
}
