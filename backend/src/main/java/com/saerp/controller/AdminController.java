package com.saerp.controller;

import com.saerp.dto.*;
import com.saerp.entity.AuditLog;
import com.saerp.security.JwtUtil;
import com.saerp.service.AuditLogService;
import com.saerp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AuditLogService auditLogService;
    private final JwtUtil jwtUtil;

    private Long extractUserIdFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            return jwtUtil.extractUserId(token);
        }
        return null;
    }

    @GetMapping("/users")
    public ResponseEntity<List<AuthDtos.UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<AuthDtos.UserDTO> createUser(@Valid @RequestBody AuthDtos.CreateUserRequest request,
                                                        HttpServletRequest httpRequest) {
        AuthDtos.UserDTO user = userService.createUser(request);
        Long actorId = extractUserId(httpRequest);
        auditLogService.log(actorId, "CREATE_USER", "USER", user.getId().toString(),
                httpRequest.getRemoteAddr(), null, "Created user: " + user.getEmail());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{userId}/toggle")
    public ResponseEntity<?> toggleUserStatus(@PathVariable("userId") Long userId, HttpServletRequest httpRequest) {
        userService.toggleUserStatus(userId);
        auditLogService.log(extractUserId(httpRequest), "TOGGLE_USER", "USER", userId.toString(),
                httpRequest.getRemoteAddr(), null, "Toggled user status");
        return ResponseEntity.ok(Map.of("message", "User status updated"));
    }

    @PostMapping("/students/import")
    public ResponseEntity<?> importStudents(@RequestParam("file") MultipartFile file,
                                             HttpServletRequest httpRequest) {
        int count = userService.importStudentsFromCsv(file);
        auditLogService.log(extractUserId(httpRequest), "CSV_IMPORT", "STUDENT", null,
                httpRequest.getRemoteAddr(), null, "Imported " + count + " students");
        return ResponseEntity.ok(Map.of("imported", count));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditLogService.getAllLogs(page, size));
    }


    @GetMapping("/students")
    public ResponseEntity<List<AuthDtos.UserDTO>> getStudents() {
        return ResponseEntity.ok(userService.getStudents());
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<AuthDtos.UserDTO>> getTeachers() {
        return ResponseEntity.ok(userService.getTeachers());
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
