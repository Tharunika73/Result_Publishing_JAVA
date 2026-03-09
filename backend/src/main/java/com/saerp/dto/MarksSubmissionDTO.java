package com.saerp.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksSubmissionDTO {
    private Long sheetId;
    private BigDecimal marks;
    private BigDecimal maxMarks;
}
