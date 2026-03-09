package com.saerp.config;

import com.saerp.entity.Student;
import com.saerp.entity.Subject;
import com.saerp.entity.Teacher;
import com.saerp.entity.User;
import com.saerp.repository.StudentRepository;
import com.saerp.repository.SubjectRepository;
import com.saerp.repository.TeacherRepository;
import com.saerp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Create demo users
        createDemoUserIfNotExists("admin@university.edu", "Admin User", "password", User.Role.ADMIN);
        createDemoUserIfNotExists("teacher@university.edu", "Teacher User", "password", User.Role.TEACHER);
        createDemoUserIfNotExists("student@university.edu", "Student User", "password", User.Role.STUDENT);

        // Safely create Teacher and Student entities for demo users if they don't exist
        User freshTeacher = userRepository.findByEmail("teacher@university.edu").orElseThrow();
        if (!teacherRepository.existsById(freshTeacher.getId())) {
            Teacher teacherEntity = Teacher.builder()
                    .user(freshTeacher)
                    .department("Computer Science")
                    .build();
            teacherRepository.save(teacherEntity);
            System.out.println("Created Teacher entity for demo teacher");
        }

        User freshStudent = userRepository.findByEmail("student@university.edu").orElseThrow();
        if (!studentRepository.existsById(freshStudent.getId())) {
            Student studentEntity = Student.builder()
                    .user(freshStudent)
                    .registerNumber("CS2024001")
                    .department("Computer Science")
                    .year(3)
                    .build();
            studentRepository.save(studentEntity);
            System.out.println("Created Student entity for demo student");
        }

        // Seed demo subjects
        createSubjectIfNotExists("Database Systems", "CS301", 5, "Computer Science");
        createSubjectIfNotExists("Web Development", "CS302", 5, "Computer Science");
        createSubjectIfNotExists("Data Science", "CS303", 5, "Computer Science");
        createSubjectIfNotExists("Operating Systems", "CS304", 5, "Computer Science");
        createSubjectIfNotExists("Computer Networks", "CS305", 5, "Computer Science");
        createSubjectIfNotExists("Software Engineering", "CS306", 5, "Computer Science");
    }

    private User createDemoUserIfNotExists(String email, String name, String password, User.Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .name(name)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(role)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
            System.out.println("Created demo user: " + email);
            return user;
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    private void createSubjectIfNotExists(String name, String code, int semester, String department) {
        if (subjectRepository.findAll().stream().noneMatch(s -> s.getSubjectCode().equals(code))) {
            Subject subject = Subject.builder()
                    .subjectName(name)
                    .subjectCode(code)
                    .semester(semester)
                    .department(department)
                    .build();
            subjectRepository.save(subject);
            System.out.println("Created demo subject: " + name + " (" + code + ")");
        }
    }
}
