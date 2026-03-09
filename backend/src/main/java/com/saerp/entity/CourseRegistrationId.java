package com.saerp.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRegistrationId implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long studentId;
    private Long subjectId;
}
