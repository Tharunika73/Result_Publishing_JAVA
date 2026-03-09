package com.saerp.service;

import com.opencsv.CSVReader;
import com.saerp.dto.AuthDtos;
import com.saerp.entity.*;
import com.saerp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AuthDtos.UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AuthDtos.UserDTO createUser(AuthDtos.CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered: " + req.getEmail());
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        if (req.getRole() == User.Role.STUDENT) {
            Student student = Student.builder()
                    .studentId(user.getId())
                    .user(user)
                    .registerNumber(req.getRegisterNumber() != null ? req.getRegisterNumber() : "REG" + user.getId())
                    .department(req.getDepartment() != null ? req.getDepartment() : "General")
                    .year(req.getYear() != null ? req.getYear() : 1)
                    .build();
            studentRepository.save(student);
        } else if (req.getRole() == User.Role.TEACHER) {
            Teacher teacher = Teacher.builder()
                    .teacherId(user.getId())
                    .user(user)
                    .department(req.getDepartment() != null ? req.getDepartment() : "General")
                    .build();
            teacherRepository.save(teacher);
        }

        return toDTO(user);
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Transactional
    public int importStudentsFromCsv(MultipartFile file) {
        int count = 0;
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            boolean first = true;
            while ((line = reader.readNext()) != null) {
                if (first) { first = false; continue; } // skip header
                if (line.length < 5) continue;

                String name = line[0].trim();
                String email = line[1].trim();
                String password = line[2].trim();
                String registerNumber = line[3].trim();
                String department = line[4].trim();
                int year = line.length > 5 ? Integer.parseInt(line[5].trim()) : 1;

                if (!userRepository.existsByEmail(email)) {
                    AuthDtos.CreateUserRequest req = new AuthDtos.CreateUserRequest(
                            name, email, password, User.Role.STUDENT,
                            department, registerNumber, year
                    );
                    createUser(req);
                    count++;
                }
            }
        } catch (Exception e) {
            log.error("CSV import error: {}", e.getMessage());
            throw new RuntimeException("CSV import failed: " + e.getMessage());
        }
        return count;
    }

    public List<AuthDtos.UserDTO> getStudents() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuthDtos.UserDTO> getTeachers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.TEACHER)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private AuthDtos.UserDTO toDTO(User user) {
        return AuthDtos.UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
