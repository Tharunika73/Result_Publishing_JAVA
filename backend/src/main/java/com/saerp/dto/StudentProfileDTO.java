package com.saerp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfileDTO {
    private Long userId;
    private String name;
    private String email;
    private String registerNumber;
    private String department;
    private Integer year;
    private String role;
}
