package com.saerp.repository;

import com.saerp.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    Optional<Marks> findByAnswerSheetSheetId(Long sheetId);
    boolean existsByAnswerSheetSheetId(Long sheetId);
}
