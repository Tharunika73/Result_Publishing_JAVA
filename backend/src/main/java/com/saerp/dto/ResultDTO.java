package com.saerp.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultDTO {
    private Long resultId;
    private String studentName;
    private String registerNumber;
    private String department;
    private String subjectName;
    private BigDecimal marks;
    private BigDecimal maxMarks;
    private String grade;
    private String status;
    private String verificationCode;
}
