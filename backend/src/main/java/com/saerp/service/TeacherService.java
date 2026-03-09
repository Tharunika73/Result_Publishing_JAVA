package com.saerp.service;

import com.saerp.dto.ExamDtos;
import com.saerp.entity.*;
import com.saerp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherService {

    private final AnswerSheetRepository answerSheetRepository;
    private final MarksRepository marksRepository;
    private final ResultChainService resultChainService;
    private final TeacherRepository teacherRepository;

    @Transactional
    public ExamDtos.AnswerSheetDTO submitMarks(ExamDtos.SubmitMarksRequest request, Long teacherUserId) {
        AnswerSheetId sheet = answerSheetRepository.findById(request.getSheetId())
                .orElseThrow(() -> new RuntimeException("Answer sheet not found"));

        if (sheet.getAssignedTeacher() == null || !sheet.getAssignedTeacher().getTeacherId().equals(teacherUserId)) {
            throw new RuntimeException("You are not authorized to evaluate this sheet");
        }

        if (sheet.getStatus() == AnswerSheetId.Status.EVALUATED) {
            throw new RuntimeException("This sheet has already been evaluated");
        }

        Teacher teacher = teacherRepository.findById(teacherUserId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Save Marks
        Marks marks = Marks.builder()
                .answerSheet(sheet)
                .marksObtained(request.getMarks())
                .evaluatedBy(teacher)
                .build();
        marksRepository.save(marks);

        // Add to Result Ledger Chain
        resultChainService.createBlock(sheet, teacher.getTeacherId(), request.getMarks());

        // Update Sheet Status
        sheet.setStatus(AnswerSheetId.Status.EVALUATED);
        sheet = answerSheetRepository.save(sheet);

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
                .assignedTeacherName(sheet.getAssignedTeacher() != null
                        ? sheet.getAssignedTeacher().getUser().getName() : null)
                .assignedTeacherEmail(sheet.getAssignedTeacher() != null
                        ? sheet.getAssignedTeacher().getUser().getEmail() : null)
                .build();
    }
}
