package com.saerp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal marks;

    @Column(name = "max_marks", precision = 5, scale = 2)
    private BigDecimal maxMarks = BigDecimal.valueOf(100);

    @Column(length = 5)
    private String grade;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PASS;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by")
    private User publishedBy;

    @PrePersist
    public void prePersist() {
        if (publishedAt == null) publishedAt = LocalDateTime.now();
    }

    public enum Status {
        PASS, FAIL, ABSENT, WITHHELD
    }
}
