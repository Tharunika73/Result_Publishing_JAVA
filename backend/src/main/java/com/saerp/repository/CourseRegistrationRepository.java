package com.saerp.repository;

import com.saerp.entity.CourseRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRegistrationRepository extends JpaRepository<CourseRegistration, Long> {

    List<CourseRegistration> findByStudentStudentId(Long studentId);

    boolean existsByStudentStudentIdAndSubjectSubjectId(Long studentId, Long subjectId);

    List<CourseRegistration> findBySubjectSubjectId(Long subjectId);
}
