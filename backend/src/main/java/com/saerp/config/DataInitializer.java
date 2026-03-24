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
import com.saerp.dto.ExamDtos;
import com.saerp.service.ExamService;
import com.saerp.service.MarkService;
import com.saerp.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRegistrationRepository courseRegistrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ExamService examService;
    private final MarkService markService;
    private final ResultService resultService;

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
        createSubjectIfNotExists("Engineering Mathematics I", "MA101", 1, "Common");
        createSubjectIfNotExists("Engineering Physics", "PH101", 1, "Common");
        createSubjectIfNotExists("Engineering Chemistry", "CH101", 1, "Common");

        createSubjectIfNotExists("Data Structures", "CS201", 3, "Computer Science");
        createSubjectIfNotExists("Object Oriented Programming", "CS202", 3, "Computer Science");
        createSubjectIfNotExists("Digital Logic Design", "CS203", 3, "Computer Science");

        createSubjectIfNotExists("Database Systems", "CS301", 5, "Computer Science");
        createSubjectIfNotExists("Web Development", "CS302", 5, "Computer Science");
        
        createSubjectIfNotExists("Blockchain Technology", "CS401", 7, "Computer Science");
        createSubjectIfNotExists("Internet of Things", "CS402", 7, "Computer Science");

        // Register demo student for demo courses
        registerStudentForCourse(freshStudent.getId(), "MA101", "Engineering Mathematics I");
        registerStudentForCourse(freshStudent.getId(), "PH101", "Engineering Physics");
        registerStudentForCourse(freshStudent.getId(), "CH101", "Engineering Chemistry");

        registerStudentForCourse(freshStudent.getId(), "CS201", "Data Structures");
        registerStudentForCourse(freshStudent.getId(), "CS202", "Object Oriented Programming");
        registerStudentForCourse(freshStudent.getId(), "CS203", "Digital Logic Design");
        
        registerStudentForCourse(freshStudent.getId(), "CS301", "Database Systems");
        registerStudentForCourse(freshStudent.getId(), "CS302", "Web Development");

        registerStudentForCourse(freshStudent.getId(), "CS401", "Blockchain Technology");
        registerStudentForCourse(freshStudent.getId(), "CS402", "Internet of Things");

        String academicYear = "2024-25";

        // Setup Semester 1: All subjects have exams, all sheets evaluated -> READY
        setupSubjectState("MA101", true, true, false, freshTeacher, academicYear);
        setupSubjectState("PH101", true, true, false, freshTeacher, academicYear);
        setupSubjectState("CH101", true, true, false, freshTeacher, academicYear);

        // Setup Semester 3: All subjects have exams, but only ONE subject is fully evaluated -> PENDING
        setupSubjectState("CS201", true, true, false, freshTeacher, academicYear); // Evaluated
        setupSubjectState("CS202", true, true, false, freshTeacher, academicYear); // Evaluated
        setupSubjectState("CS203", true, false, false, freshTeacher, academicYear); // NOT Evaluated

        // Setup Semester 5: Exams created, but NO evaluations -> PENDING
        setupSubjectState("CS301", true, false, false, freshTeacher, academicYear);
        setupSubjectState("CS302", true, false, false, freshTeacher, academicYear);

        // Setup Semester 7: NO exams created yet -> PENDING
        setupSubjectState("CS401", false, false, false, freshTeacher, academicYear);
        setupSubjectState("CS402", false, false, false, freshTeacher, academicYear);
    }

    private void setupSubjectState(String subjectCode, boolean createExam, boolean evaluateAll, boolean evaluatePartial, User teacherUser, String academicYear) {
        try {
            if (!createExam) return;

            Subject subject = subjectRepository.findAll().stream()
                    .filter(s -> s.getSubjectCode().equals(subjectCode))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectCode));

            User admin = userRepository.findByRole(User.Role.ADMIN).stream().findFirst().orElseThrow();

            // 1. Create Exam Session
            ExamDtos.CreateExamRequest examReq = ExamDtos.CreateExamRequest.builder()
                    .subjectId(subject.getSubjectId())
                    .examDate(LocalDate.now().minusDays(10))
                    .academicYear(academicYear)
                    .build();
            ExamDtos.ExamSessionDTO session = examService.createExamSession(examReq, admin.getId());

            // 2. Generate Answer Sheets
            List<ExamDtos.AnswerSheetDTO> sheets = examService.generateSheetIds(session.getExamId());

            // 3. Assign Teacher
            for (ExamDtos.AnswerSheetDTO sheet : sheets) {
                examService.assignTeacherToSheet(sheet.getSheetId(), teacherUser.getId());
            }

            // 4. Evaluate if requested
            if (evaluateAll || evaluatePartial) {
                int countToEvaluate = evaluateAll ? sheets.size() : Math.max(1, sheets.size() / 2);
                for (int i = 0; i < countToEvaluate; i++) {
                    ExamDtos.AnswerSheetDTO sheet = sheets.get(i);
                    ExamDtos.SubmitMarksRequest marksReq = ExamDtos.SubmitMarksRequest.builder()
                            .sheetId(sheet.getSheetId())
                            .marks(new java.math.BigDecimal(80 + (i * 2))) // dummy marks
                            .build();
                    markService.submitMarks(marksReq, teacherUser.getId());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to setup subject state for " + subjectCode + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private User createDemoUserIfNotExists(String email, String name, String password, User.Role role) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(role)
                    .isActive(true)
                    .build();
            System.out.println("Created demo user: " + email);
        } else {
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setIsActive(true);
            System.out.println("Updated password and activated demo user: " + email);
        }
        return userRepository.save(user);
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
