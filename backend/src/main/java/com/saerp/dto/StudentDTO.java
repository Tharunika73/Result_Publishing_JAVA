package com.saerp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDTO {
    private Long studentId;
    private String registerNumber;
    private String name;
    private String email;
    private String department;
    private Integer year;
}
