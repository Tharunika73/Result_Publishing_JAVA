package com.saerp.dto;

import lombok.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExamDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerSheetDTO {
        private Long sheetId;
        private String randomCode;
        private String status;
        private String subjectName;
        private String subjectCode;
        private String examDate;
        private String assignedTeacherName;
        private String assignedTeacherEmail;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateSheetsRequest {
        @NotNull private Long examId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignTeacherRequest {
        @NotNull private Long sheetId;
        @NotNull private Long teacherId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitMarksRequest {
        @NotNull private Long sheetId;
        @NotNull @DecimalMin("0") @DecimalMax("100") private BigDecimal marks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResultDTO {
        private Long resultId;
        private String studentName;
        private String registerNumber;
        private String subject;
        private BigDecimal marks;
        private BigDecimal maxMarks;
        private String grade;
        private String status;
        private String publishedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExamSessionDTO {
        private Long examId;
        private String subjectName;
        private String subjectCode;
        private LocalDate examDate;
        private String academicYear;
        private long totalSheets;
        private long evaluatedSheets;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateExamRequest {
        @NotNull private Long subjectId;
        @NotNull private LocalDate examDate;
        @NotBlank private String academicYear;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChainBlockDTO {
        private Long blockId;
        private String previousHash;
        private String randomCode;
        private Long teacherId;
        private BigDecimal marks;
        private String timestamp;
        private String currentHash;
        private boolean tampered;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CourseDTO {
        private Long subjectId;
        private String subjectName;
        private String subjectCode;
        private Integer semester;
        private String department;
        private boolean registered;
    }
}
