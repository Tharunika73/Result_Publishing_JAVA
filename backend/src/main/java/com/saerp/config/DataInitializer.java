package com.saerp.config;

import com.saerp.entity.Student;
import com.saerp.entity.Subject;
import com.saerp.entity.Teacher;
import com.saerp.entity.User;
import com.saerp.entity.CourseRegistration;
import com.saerp.repository.StudentRepository;
import com.saerp.repository.SubjectRepository;
import com.saerp.repository.TeacherRepository;
import com.saerp.repository.UserRepository;
import com.saerp.repository.CourseRegistrationRepository;
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
    private final CourseRegistrationRepository courseRegistrationRepository;
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
                    .teacherId(freshTeacher.getId())
                    .user(freshTeacher)
                    .department("Computer Science")
                    .build();
            teacherRepository.save(teacherEntity);
            System.out.println("Created Teacher entity for demo teacher");
        }

        User freshStudent = userRepository.findByEmail("student@university.edu").orElseThrow();
        if (!studentRepository.existsById(freshStudent.getId())) {
            Student studentEntity = Student.builder()
                    .studentId(freshStudent.getId())
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
        createSubjectIfNotExists("Machine Learning", "CS307", 6, "Computer Science");
        createSubjectIfNotExists("Cloud Computing", "CS308", 6, "Computer Science");
        createSubjectIfNotExists("Cybersecurity", "CS309", 6, "Computer Science");
        createSubjectIfNotExists("Artificial Intelligence", "CS310", 6, "Computer Science");
        createSubjectIfNotExists("Mobile App Development", "CS311", 6, "Computer Science");
        createSubjectIfNotExists("Blockchain Technology", "CS312", 7, "Computer Science");

        // Register demo student for demo courses
        if (studentRepository.existsById(13L)) {
            registerStudentForCourse(13L, "CS301", "Database Systems");
            registerStudentForCourse(13L, "CS302", "Web Development");
            registerStudentForCourse(13L, "CS303", "Data Science");
            registerStudentForCourse(13L, "CS307", "Machine Learning");
        }
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

    private void registerStudentForCourse(Long studentId, String subjectCode, String subjectName) {
        try {
            Student student = studentRepository.findById(studentId).orElse(null);
            Subject subject = subjectRepository.findAll().stream()
                    .filter(s -> s.getSubjectCode().equals(subjectCode))
                    .findFirst()
                    .orElse(null);

            if (student != null && subject != null) {
                boolean alreadyRegistered = courseRegistrationRepository
                        .existsByStudentStudentIdAndSubjectSubjectId(studentId, subject.getSubjectId());
                
                if (!alreadyRegistered) {
                    CourseRegistration registration = CourseRegistration.builder()
                            .student(student)
                            .subject(subject)
                            .build();
                    courseRegistrationRepository.save(registration);
                    System.out.println("Registered student (ID: " + studentId + ") for course: " + subjectName);
                }
            }
        } catch (Exception e) {
            System.out.println("Could not register student for course: " + subjectName);
        }
    }
}
