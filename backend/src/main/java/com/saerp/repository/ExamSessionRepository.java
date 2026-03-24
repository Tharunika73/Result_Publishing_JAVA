package com.saerp.repository;

import com.saerp.entity.ExamSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {
    List<ExamSession> findBySubjectSubjectIdAndAcademicYear(Long subjectId, String academicYear);
}
