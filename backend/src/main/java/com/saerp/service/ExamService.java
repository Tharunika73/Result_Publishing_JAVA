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
    private final ResultRepository resultRepository;
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

    public List<ExamDtos.SemesterStatusDTO> getSemesterStatuses(String academicYear, List<Integer> semesters) {
        List<ExamDtos.SemesterStatusDTO> result = new ArrayList<>();

        for (Integer sem : semesters) {
            List<Subject> subjects = subjectRepository.findBySemester(sem);
            if (subjects.isEmpty()) {
                result.add(ExamDtos.SemesterStatusDTO.builder()
                        .semester(sem)
                        .academicYear(academicYear)
                        .readyToPublish(false)
                        .subjects(new ArrayList<>())
                        .build());
                continue;
            }

            List<ExamDtos.SubjectStatusDTO> subjectStatuses = new ArrayList<>();
            boolean allReady = true;

            for (Subject sub : subjects) {
                List<ExamSession> sessions = examSessionRepository.findBySubjectSubjectIdAndAcademicYear(sub.getSubjectId(), academicYear);
                if (sessions.isEmpty()) {
                    allReady = false;
                    subjectStatuses.add(ExamDtos.SubjectStatusDTO.builder()
                            .subjectName(sub.getSubjectName())
                            .subjectCode(sub.getSubjectCode())
                            .examId(null)
                            .totalSheets(0)
                            .evaluatedSheets(0)
                            .build());
                } else {
                    // Usually there's only one session per subject per year, handle the latest one
                    ExamSession session = sessions.get(sessions.size() - 1);
                    long total = answerSheetRepository.findByExamSessionExamId(session.getExamId()).size();
                    long evaluated = answerSheetRepository.countByExamSessionExamIdAndStatus(session.getExamId(), AnswerSheetId.Status.EVALUATED);
                    
                    if (total == 0 || total != evaluated) {
                        allReady = false;
                    }

                    subjectStatuses.add(ExamDtos.SubjectStatusDTO.builder()
                            .subjectName(sub.getSubjectName())
                            .subjectCode(sub.getSubjectCode())
                            .examId(session.getExamId())
                            .totalSheets(total)
                            .evaluatedSheets(evaluated)
                            .build());
                }
            }

            // Check if semester results have been published already
            // Only consider it published if it is fully ready AND results exist
            boolean published = allReady && subjects.stream().anyMatch(sub -> {
                List<ExamSession> sessions = examSessionRepository.findBySubjectSubjectIdAndAcademicYear(sub.getSubjectId(), academicYear);
                if (sessions.isEmpty()) return false;
                Long examId = sessions.get(sessions.size() - 1).getExamId();
                return answerSheetRepository.findByExamSessionExamId(examId).stream()
                        .anyMatch(sheet -> {
                            try {
                                String decrypted = aesEncryptionUtil.decrypt(sheet.getEncryptedStudentId());
                                Long studentId = Long.parseLong(decrypted);
                                return resultRepository.findByStudentStudentId(studentId).stream()
                                        .anyMatch(r -> r.getSubject().getSubjectId().equals(sub.getSubjectId()));
                            } catch (Exception e) { return false; }
                        });
            });

            int year = (int) Math.ceil(sem / 2.0);

            result.add(ExamDtos.SemesterStatusDTO.builder()
                    .semester(sem)
                    .year(year)
                    .academicYear(academicYear)
                    .readyToPublish(allReady)
                    .alreadyPublished(published)
                    .subjects(subjectStatuses)
                    .build());
        }

        return result;
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
                .semester(session.getSubject().getSemester())
                .examDate(session.getExamDate())
                .academicYear(session.getAcademicYear())
                .totalSheets(total)
                .evaluatedSheets(evaluated)
                .build();
    }
}
