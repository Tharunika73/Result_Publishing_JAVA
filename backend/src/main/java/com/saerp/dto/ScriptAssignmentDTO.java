package com.saerp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScriptAssignmentDTO {
    private Long sheetId;
    private String randomCode;
    private String subjectName;
    private Long assignedTeacherId;
    private String teacherName;
    private String status;
}
