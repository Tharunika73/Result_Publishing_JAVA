package com.saerp.service;

import com.saerp.dto.ExamDtos;
import com.saerp.entity.*;
import com.saerp.repository.*;
import com.saerp.util.AesEncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamSessionRepository examSessionRepository;
    private final AnswerSheetRepository answerSheetRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final CourseRegistrationRepository courseRegistrationRepository;
    private final AesEncryptionUtil aesEncryptionUtil;

    @Transactional
    public ExamDtos.ExamSessionDTO createExamSession(ExamDtos.CreateExamRequest req, Long creatorId) {
        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        User creator = new User();
        creator.setId(creatorId);

        ExamSession session = ExamSession.builder()
                .subject(subject)
                .examDate(req.getExamDate())
                .academicYear(req.getAcademicYear())
                .createdBy(creator)
                .build();
        session = examSessionRepository.save(session);
        return toExamDTO(session);
    }

    public List<ExamDtos.ExamSessionDTO> getAllExams() {
        return examSessionRepository.findAll().stream()
                .map(this::toExamDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ExamDtos.AnswerSheetDTO> generateSheetIds(Long examId) {
        ExamSession session = examSessionRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam session not found"));

        List<Student> students = courseRegistrationRepository.findBySubjectSubjectId(session.getSubject().getSubjectId()).stream()
                .map(CourseRegistration::getStudent)
                .collect(Collectors.toList());

        List<ExamDtos.AnswerSheetDTO> result = new ArrayList<>();

        for (Student student : students) {
            // Check if sheet already exists for this student and exam
            boolean exists = answerSheetRepository.findByExamSessionExamId(examId).stream()
                    .anyMatch(s -> {
                        try {
                            String decrypted = aesEncryptionUtil.decrypt(s.getEncryptedStudentId());
                            return decrypted.equals(student.getStudentId().toString());
                        } catch (Exception e) { return false; }
                    });

            if (!exists) {
                String randomCode = generateRandomCode();
                String encryptedStudentId = aesEncryptionUtil.encrypt(student.getStudentId().toString());

                AnswerSheetId sheet = AnswerSheetId.builder()
                        .encryptedStudentId(encryptedStudentId)
                        .randomCode(randomCode)
                        .examSession(session)
                        .status(AnswerSheetId.Status.PENDING)
                        .build();
                sheet = answerSheetRepository.save(sheet);
                result.add(toSheetDTO(sheet));
            }
        }
        return result;
    }

    @Transactional
    public ExamDtos.AnswerSheetDTO assignTeacherToSheet(Long sheetId, Long teacherId) {
        AnswerSheetId sheet = answerSheetRepository.findById(sheetId)
                .orElseThrow(() -> new RuntimeException("Sheet not found"));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        sheet.setAssignedTeacher(teacher);
        sheet = answerSheetRepository.save(sheet);
        return toSheetDTO(sheet);
    }

    public List<ExamDtos.AnswerSheetDTO> getSheetsForExam(Long examId) {
        return answerSheetRepository.findByExamSessionExamId(examId).stream()
                .map(this::toSheetDTO)
                .collect(Collectors.toList());
    }

    public List<ExamDtos.AnswerSheetDTO> getSheetsForTeacher(Long teacherId) {
        return answerSheetRepository.findByAssignedTeacherId(teacherId).stream()
                .map(this::toSheetDTO)
                .collect(Collectors.toList());
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    private String generateRandomCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        String code = sb.toString();
        // Ensure uniqueness
        while (answerSheetRepository.findByRandomCode(code).isPresent()) {
            sb = new StringBuilder();
            for (int i = 0; i < 8; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
            code = sb.toString();
        }
        return code;
    }

    public ExamDtos.AnswerSheetDTO toSheetDTO(AnswerSheetId sheet) {
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

    private ExamDtos.ExamSessionDTO toExamDTO(ExamSession session) {
        long total = answerSheetRepository.findByExamSessionExamId(session.getExamId()).size();
        long evaluated = answerSheetRepository.countByExamSessionExamIdAndStatus(
                session.getExamId(), AnswerSheetId.Status.EVALUATED);
        return ExamDtos.ExamSessionDTO.builder()
                .examId(session.getExamId())
                .subjectName(session.getSubject().getSubjectName())
                .subjectCode(session.getSubject().getSubjectCode())
                .examDate(session.getExamDate())
                .academicYear(session.getAcademicYear())
                .totalSheets(total)
                .evaluatedSheets(evaluated)
                .build();
    }
}
