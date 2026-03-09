package com.saerp.controller;

import com.saerp.dto.ExamDtos;
import com.saerp.dto.StudentProfileDTO;
import com.saerp.entity.CourseRegistration;
import com.saerp.entity.Student;
import com.saerp.entity.Subject;
import com.saerp.entity.User;
import com.saerp.repository.CourseRegistrationRepository;
import com.saerp.repository.StudentRepository;
import com.saerp.repository.SubjectRepository;
import com.saerp.repository.UserRepository;
import com.saerp.security.JwtUtil;
import com.saerp.service.ExamService;
import com.saerp.service.PdfService;
import com.saerp.service.ResultService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final ResultService resultService;
    private final PdfService pdfService;
    private final ExamService examService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final CourseRegistrationRepository courseRegistrationRepository;

    @GetMapping("/results")
    public ResponseEntity<?> getMyResults(HttpServletRequest http) {
        Long studentId = extractUserId(http);
        if (!studentRepository.existsById(studentId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Student profile not found. Please contact admin."));
        }
        return ResponseEntity.ok(resultService.getStudentResults(studentId));
    }

    @GetMapping("/results/pdf")
    public ResponseEntity<byte[]> downloadResultPdf(HttpServletRequest http) {
        Long studentId = extractUserId(http);
        List<ExamDtos.ResultDTO> results = resultService.getStudentResults(studentId);

        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        byte[] pdf = pdfService.generateResultPdf(user.getName(), student.getRegisterNumber(), results);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=result.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest http) {
        Long userId = extractUserId(http);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String regNum = "Pending";
        String dept = "Pending";
        Integer year = 0;
        
        var studentOpt = studentRepository.findById(userId);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            regNum = student.getRegisterNumber();
            dept = student.getDepartment();
            year = student.getYear();
        }

        StudentProfileDTO profile = StudentProfileDTO.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .registerNumber(regNum)
                .department(dept)
                .year(year)
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/courses")
    public ResponseEntity<List<ExamDtos.CourseDTO>> getCourses(HttpServletRequest http) {
        Long studentId = extractUserId(http);
        List<Subject> allSubjects = subjectRepository.findAll();
        
        List<Long> registeredSubjectIds = List.of();
        if (studentRepository.existsById(studentId)) {
            registeredSubjectIds = courseRegistrationRepository.findByStudentStudentId(studentId).stream()
                    .map(reg -> reg.getSubject().getSubjectId())
                    .collect(Collectors.toList());
        }

        List<Long> finalRegisteredSubjectIds = registeredSubjectIds;
        List<ExamDtos.CourseDTO> response = allSubjects.stream().map(sub -> ExamDtos.CourseDTO.builder()
                .subjectId(sub.getSubjectId())
                .subjectName(sub.getSubjectName())
                .subjectCode(sub.getSubjectCode())
                .semester(sub.getSemester())
                .department(sub.getDepartment())
                .registered(finalRegisteredSubjectIds.contains(sub.getSubjectId()))
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/courses/{subjectId}/register")
    public ResponseEntity<?> registerCourse(@PathVariable("subjectId") Long subjectId, HttpServletRequest http) {
        Long studentId = extractUserId(http);
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found. Please contact admin to complete your profile before registering."));

        if (courseRegistrationRepository.existsByStudentStudentIdAndSubjectSubjectId(studentId, subjectId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already registered for this course"));
        }

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        CourseRegistration reg = CourseRegistration.builder()
                .student(student)
                .subject(subject)
                .build();
        courseRegistrationRepository.save(reg);

        return ResponseEntity.ok(Map.of("message", "Successfully registered for " + subject.getSubjectName()));
    }

    @GetMapping("/exams")
    public ResponseEntity<List<ExamDtos.ExamSessionDTO>> getExams(HttpServletRequest http) {
        Long studentId = extractUserId(http);
        
        if (!studentRepository.existsById(studentId)) {
            return ResponseEntity.ok(List.of());
        }

        List<Long> registeredSubjectIds = courseRegistrationRepository.findByStudentStudentId(studentId).stream()
                .map(reg -> reg.getSubject().getSubjectId())
                .collect(Collectors.toList());

        List<ExamDtos.ExamSessionDTO> filteredExams = examService.getAllExams().stream()
                .filter(ex -> {
                    Subject s = subjectRepository.findAll().stream().filter(sub -> sub.getSubjectCode().equals(ex.getSubjectCode())).findFirst().orElse(null);
                    return s != null && registeredSubjectIds.contains(s.getSubjectId());
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredExams);
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
