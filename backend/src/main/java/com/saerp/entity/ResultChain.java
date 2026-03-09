package com.saerp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "result_chain")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultChain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "block_id")
    private Long blockId;

    @Column(name = "previous_hash", nullable = false, length = 64)
    private String previousHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sheet_id", nullable = false)
    private AnswerSheetId answerSheet;

    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal marks;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "current_hash", nullable = false, unique = true, length = 64)
    private String currentHash;

    @Column(name = "is_tampered")
    private Boolean isTampered = false;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) timestamp = LocalDateTime.now();
        if (isTampered == null) isTampered = false;
    }
}
