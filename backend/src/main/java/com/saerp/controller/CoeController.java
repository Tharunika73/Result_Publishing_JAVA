package com.saerp.controller;

import com.saerp.dto.ExamDtos;
import com.saerp.security.JwtUtil;
import com.saerp.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/coe")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'COE')")
public class CoeController {

    private final ExamService examService;
    private final ResultService resultService;
    private final ResultChainService chainService;
    private final AuditLogService auditLogService;
    private final JwtUtil jwtUtil;

    @GetMapping("/exams")
    public ResponseEntity<List<ExamDtos.ExamSessionDTO>> getExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @PostMapping("/exams")
    public ResponseEntity<ExamDtos.ExamSessionDTO> createExam(
            @Valid @RequestBody ExamDtos.CreateExamRequest req, HttpServletRequest http) {
        Long userId = extractUserId(http);
        ExamDtos.ExamSessionDTO exam = examService.createExamSession(req, userId);
        auditLogService.log(userId, "CREATE_EXAM", "EXAM", exam.getExamId().toString(),
                http.getRemoteAddr(), null, "Created exam: " + exam.getSubjectName());
        return ResponseEntity.ok(exam);
    }

    @PostMapping("/exams/{examId}/generate-sheets")
    public ResponseEntity<List<ExamDtos.AnswerSheetDTO>> generateSheets(
            @PathVariable("examId") Long examId, HttpServletRequest http) {
        Long userId = extractUserId(http);
        List<ExamDtos.AnswerSheetDTO> sheets = examService.generateSheetIds(examId);
        auditLogService.log(userId, "GENERATE_SHEETS", "EXAM", examId.toString(),
                http.getRemoteAddr(), null, "Generated " + sheets.size() + " sheets");
        return ResponseEntity.ok(sheets);
    }

    @PostMapping("/sheets/assign-teacher")
    public ResponseEntity<ExamDtos.AnswerSheetDTO> assignTeacher(
            @Valid @RequestBody ExamDtos.AssignTeacherRequest req, HttpServletRequest http) {
        Long userId = extractUserId(http);
        ExamDtos.AnswerSheetDTO sheet = examService.assignTeacherToSheet(req.getSheetId(), req.getTeacherId());
        auditLogService.log(userId, "ASSIGN_TEACHER", "SHEET", req.getSheetId().toString(),
                http.getRemoteAddr(), null, "Assigned teacher " + req.getTeacherId());
        return ResponseEntity.ok(sheet);
    }

    @GetMapping("/exams/{examId}/sheets")
    public ResponseEntity<List<ExamDtos.AnswerSheetDTO>> getSheets(@PathVariable("examId") Long examId) {
        return ResponseEntity.ok(examService.getSheetsForExam(examId));
    }

    @PostMapping("/exams/{examId}/publish")
    public ResponseEntity<List<ExamDtos.ResultDTO>> publishResults(
            @PathVariable("examId") Long examId, HttpServletRequest http) {
        Long userId = extractUserId(http);
        List<ExamDtos.ResultDTO> results = resultService.publishResults(examId, userId);
        auditLogService.log(userId, "PUBLISH_RESULTS", "EXAM", examId.toString(),
                http.getRemoteAddr(), null, "Published " + results.size() + " results");
        return ResponseEntity.ok(results);
    }

    @GetMapping("/results")
    public ResponseEntity<List<ExamDtos.ResultDTO>> getAllResults() {
        return ResponseEntity.ok(resultService.getAllResults());
    }

    @GetMapping("/results/search")
    public ResponseEntity<List<ExamDtos.ResultDTO>> searchResults(@RequestParam("q") String q) {
        return ResponseEntity.ok(resultService.searchResults(q));
    }

    @GetMapping("/chain")
    public ResponseEntity<List<ExamDtos.ChainBlockDTO>> getChain() {
        return ResponseEntity.ok(chainService.getAllBlocks());
    }

    @GetMapping("/chain/verify")
    public ResponseEntity<?> verifyChain() {
        boolean valid = chainService.verifyChainIntegrity();
        return ResponseEntity.ok(Map.of("integrity", valid ? "VALID" : "TAMPERED", "verified", true));
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getSubjects() {
        return ResponseEntity.ok(examService.getAllSubjects());
    }

    private Long extractUserId(HttpServletRequest request) {
        try {
            String auth = request.getHeader("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                return jwtUtil.extractUserId(auth.substring(7));
            }
        } catch (Exception ignored) {}
        return null;
    }
}
