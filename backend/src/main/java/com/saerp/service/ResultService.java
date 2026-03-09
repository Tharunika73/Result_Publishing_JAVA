package com.saerp.service;

import com.saerp.dto.ExamDtos;
import com.saerp.entity.*;
import com.saerp.repository.*;
import com.saerp.util.AesEncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResultService {

    private final AnswerSheetRepository answerSheetRepository;
    private final MarksRepository marksRepository;
    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AesEncryptionUtil aesEncryptionUtil;
    private final EmailService emailService;

    @Transactional
    public List<ExamDtos.ResultDTO> publishResults(Long examId, Long publisherId) {
        List<AnswerSheetId> sheets = answerSheetRepository.findByExamSessionExamId(examId);
        User publisher = userRepository.findById(publisherId)
                .orElseThrow(() -> new RuntimeException("Publisher not found"));

        List<ExamDtos.ResultDTO> results = new java.util.ArrayList<>();

        for (AnswerSheetId sheet : sheets) {
            if (sheet.getStatus() != AnswerSheetId.Status.EVALUATED) continue;

            try {
                // Decrypt student ID
                String decryptedStudentId = aesEncryptionUtil.decrypt(sheet.getEncryptedStudentId());
                Long studentId = Long.parseLong(decryptedStudentId);

                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

                Marks marks = marksRepository.findByAnswerSheetSheetId(sheet.getSheetId())
                        .orElseThrow(() -> new RuntimeException("Marks not found for sheet: " + sheet.getSheetId()));

                Subject subject = sheet.getExamSession().getSubject();
                String grade = computeGrade(marks.getMarksObtained(), marks.getMaxMarks());
                Result.Status status = marks.getMarksObtained().compareTo(marks.getMaxMarks().multiply(BigDecimal.valueOf(0.35))) >= 0
                        ? Result.Status.PASS : Result.Status.FAIL;

                // Upsert result
                Result result = resultRepository.findByStudentStudentId(studentId).stream()
                        .filter(r -> r.getSubject().getSubjectId().equals(subject.getSubjectId()))
                        .findFirst()
                        .orElseGet(() -> {
                            Result newResult = new Result();
                            newResult.setStudent(student);
                            newResult.setSubject(subject);
                            newResult.setPublishedBy(publisher);
                            return newResult;
                        });

                result.setMarks(marks.getMarksObtained());
                result.setMaxMarks(marks.getMaxMarks());
                result.setGrade(grade);
                result.setStatus(status);
                result.setPublishedBy(publisher);
                result = resultRepository.save(result);

                results.add(toResultDTO(result, student));

                // Email notification (async)
                emailService.sendResultNotification(student.getUser().getEmail(),
                        student.getUser().getName(), subject.getSubjectName(), grade);

            } catch (Exception e) {
                log.error("Error publishing result for sheet {}: {}", sheet.getSheetId(), e.getMessage());
            }
        }
        return results;
    }

    public List<ExamDtos.ResultDTO> getStudentResults(Long studentId) {
        return resultRepository.findByStudentStudentId(studentId).stream()
                .map(r -> toResultDTO(r, r.getStudent()))
                .collect(Collectors.toList());
    }

    public List<ExamDtos.ResultDTO> searchResults(String query) {
        return resultRepository.searchByStudentNameOrRegister(query).stream()
                .map(r -> toResultDTO(r, r.getStudent()))
                .collect(Collectors.toList());
    }

    public List<ExamDtos.ResultDTO> getAllResults() {
        return resultRepository.findAll().stream()
                .map(r -> toResultDTO(r, r.getStudent()))
                .collect(Collectors.toList());
    }

    private String computeGrade(BigDecimal marks, BigDecimal maxMarks) {
        double percentage = marks.doubleValue() / maxMarks.doubleValue() * 100;
        if (percentage >= 90) return "O";
        if (percentage >= 80) return "A+";
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "B+";
        if (percentage >= 50) return "B";
        if (percentage >= 40) return "C";
        if (percentage >= 35) return "D";
        return "F";
    }

    private ExamDtos.ResultDTO toResultDTO(Result result, Student student) {
        return ExamDtos.ResultDTO.builder()
                .resultId(result.getResultId())
                .studentName(student.getUser().getName())
                .registerNumber(student.getRegisterNumber())
                .subject(result.getSubject().getSubjectName())
                .marks(result.getMarks())
                .maxMarks(result.getMaxMarks())
                .grade(result.getGrade())
                .status(result.getStatus().name())
                .publishedAt(result.getPublishedAt() != null ? result.getPublishedAt().toString() : null)
                .build();
    }
}
