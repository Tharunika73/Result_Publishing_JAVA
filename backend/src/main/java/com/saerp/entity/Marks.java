package com.saerp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mark_id")
    private Long markId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sheet_id", nullable = false, unique = true)
    private AnswerSheetId answerSheet;

    @Column(name = "marks_obtained", nullable = false, precision = 5, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "max_marks", precision = 5, scale = 2)
    private BigDecimal maxMarks = BigDecimal.valueOf(100);

    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluated_by")
    private Teacher evaluatedBy;

    @PrePersist
    public void prePersist() {
        if (evaluatedAt == null) evaluatedAt = LocalDateTime.now();
    }
}
