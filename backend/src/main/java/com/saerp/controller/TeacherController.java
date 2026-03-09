package com.saerp.controller;

import com.saerp.dto.ExamDtos;
import com.saerp.security.JwtUtil;
import com.saerp.service.AuditLogService;
import com.saerp.service.ExamService;
import com.saerp.service.TeacherService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    private final ExamService examService;
    private final TeacherService teacherService;
    private final AuditLogService auditLogService;
    private final JwtUtil jwtUtil;

    @GetMapping("/sheets")
    public ResponseEntity<List<ExamDtos.AnswerSheetDTO>> getMySheets(HttpServletRequest http) {
        Long teacherId = extractUserId(http);
        return ResponseEntity.ok(examService.getSheetsForTeacher(teacherId));
    }

    @PostMapping("/marks")
    public ResponseEntity<ExamDtos.AnswerSheetDTO> submitMarks(
            @Valid @RequestBody ExamDtos.SubmitMarksRequest req, HttpServletRequest http) {
        Long teacherId = extractUserId(http);
        ExamDtos.AnswerSheetDTO result = teacherService.submitMarks(req, teacherId);
        
        auditLogService.log(teacherId, "SUBMIT_MARKS", "SHEET", req.getSheetId().toString(),
                http.getRemoteAddr(), null, "Submitted marks for anonymous sheet");
                
        return ResponseEntity.ok(result);
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
