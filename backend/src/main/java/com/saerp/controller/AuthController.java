package com.saerp.controller;

import com.saerp.dto.AuthDtos;
import com.saerp.service.AuditLogService;
import com.saerp.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDtos.LoginRequest request,
                                    HttpServletRequest httpRequest) {
        try {
            AuthDtos.LoginResponse response = authService.login(request);
            auditLogService.log(response.getUserId(), "LOGIN", "AUTH", null,
                    httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"),
                    "Login successful");
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.core.AuthenticationException e) {
            auditLogService.log(null, "LOGIN_FAILED", "AUTH", null,
                    httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"),
                    "Login failed for: " + request.getEmail());
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        } catch (Exception e) {
            auditLogService.log(null, "LOGIN_ERROR", "AUTH", null,
                    httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"),
                    "Login system error for: " + request.getEmail());
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error. Please try again later."));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "SAERP API"));
    }
}
