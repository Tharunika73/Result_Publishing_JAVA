package com.saerp.service;

import com.saerp.dto.ExamDtos;
import com.saerp.entity.*;
import com.saerp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MarkService {

    private final AnswerSheetRepository answerSheetRepository;
    private final MarksRepository marksRepository;
    private final TeacherRepository teacherRepository;
    private final ResultChainService resultChainService;

    @Transactional
    public ExamDtos.AnswerSheetDTO submitMarks(ExamDtos.SubmitMarksRequest req, Long teacherId) {
        AnswerSheetId sheet = answerSheetRepository.findById(req.getSheetId())
                .orElseThrow(() -> new RuntimeException("Sheet not found: " + req.getSheetId()));

        if (sheet.getAssignedTeacher() == null ||
                !sheet.getAssignedTeacher().getTeacherId().equals(teacherId)) {
            throw new RuntimeException("Not authorized to evaluate this sheet");
        }

        if (sheet.getStatus() == AnswerSheetId.Status.EVALUATED) {
            throw new RuntimeException("Sheet already evaluated");
        }

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Save marks
        Marks marks = Marks.builder()
                .answerSheet(sheet)
                .marksObtained(req.getMarks())
                .maxMarks(java.math.BigDecimal.valueOf(100))
                .evaluatedBy(teacher)
                .build();
        marksRepository.save(marks);

        // Update sheet status
        sheet.setStatus(AnswerSheetId.Status.EVALUATED);
        sheet = answerSheetRepository.save(sheet);

        // Create blockchain hash block
        resultChainService.createBlock(sheet, teacherId, req.getMarks());

        return toSheetDTO(sheet);
    }

    private ExamDtos.AnswerSheetDTO toSheetDTO(AnswerSheetId sheet) {
        return ExamDtos.AnswerSheetDTO.builder()
                .sheetId(sheet.getSheetId())
                .randomCode(sheet.getRandomCode())
                .status(sheet.getStatus().name())
                .subjectName(sheet.getExamSession().getSubject().getSubjectName())
                .subjectCode(sheet.getExamSession().getSubject().getSubjectCode())
                .examDate(sheet.getExamSession().getExamDate().toString())
                .build();
    }
}
