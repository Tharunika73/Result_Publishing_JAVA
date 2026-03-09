package com.saerp.repository;

import com.saerp.entity.AnswerSheetId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerSheetRepository extends JpaRepository<AnswerSheetId, Long> {
    Optional<AnswerSheetId> findByRandomCode(String randomCode);

    @Query("SELECT a FROM AnswerSheetId a WHERE a.assignedTeacher.teacherId = :teacherId")
    List<AnswerSheetId> findByAssignedTeacherId(Long teacherId);

    List<AnswerSheetId> findByExamSessionExamId(Long examId);

    long countByExamSessionExamIdAndStatus(Long examId, AnswerSheetId.Status status);
}
