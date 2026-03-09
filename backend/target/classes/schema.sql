-- ============================================================
-- SAERP - Secure Anonymous Examination Result Portal
-- Database Schema (MySQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS saerp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saerp_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'COE', 'TEACHER', 'STUDENT') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    student_id BIGINT PRIMARY KEY,
    register_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_students_register (register_number)
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id BIGINT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    subject_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(150) NOT NULL,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    semester INT NOT NULL,
    department VARCHAR(100),
    INDEX idx_subjects_code (subject_code)
);

-- Course Registrations (Junction table for students and subjects)
CREATE TABLE IF NOT EXISTS course_registrations (
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    INDEX idx_registration_student (student_id),
    INDEX idx_registration_subject (subject_id)
);

-- Exam sessions table
CREATE TABLE IF NOT EXISTS exam_sessions (
    exam_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    exam_date DATE NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_exam_subject (subject_id)
);

-- Answer sheet IDs (anonymous mapping)
CREATE TABLE IF NOT EXISTS answer_sheet_ids (
    sheet_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    encrypted_student_id TEXT NOT NULL,
    random_code VARCHAR(20) NOT NULL UNIQUE,
    exam_id BIGINT NOT NULL,
    assigned_teacher_id BIGINT,
    status ENUM('PENDING', 'EVALUATED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exam_sessions(exam_id),
    FOREIGN KEY (assigned_teacher_id) REFERENCES teachers(teacher_id),
    INDEX idx_sheet_random_code (random_code),
    INDEX idx_sheet_exam (exam_id),
    INDEX idx_sheet_teacher (assigned_teacher_id)
);

-- Marks table
CREATE TABLE IF NOT EXISTS marks (
    mark_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sheet_id BIGINT NOT NULL UNIQUE,
    marks_obtained DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) DEFAULT 100.00,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evaluated_by BIGINT,
    FOREIGN KEY (sheet_id) REFERENCES answer_sheet_ids(sheet_id),
    FOREIGN KEY (evaluated_by) REFERENCES teachers(teacher_id)
);

-- Results table (published after decryption)
CREATE TABLE IF NOT EXISTS results (
    result_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    marks DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) DEFAULT 100.00,
    grade VARCHAR(5),
    status ENUM('PASS', 'FAIL', 'ABSENT', 'WITHHELD') DEFAULT 'PASS',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_by BIGINT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY (published_by) REFERENCES users(id),
    UNIQUE KEY unique_student_subject (student_id, subject_id),
    INDEX idx_results_student (student_id)
);

-- Blockchain-style result integrity chain
CREATE TABLE IF NOT EXISTS result_chain (
    block_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    previous_hash VARCHAR(64) NOT NULL,
    sheet_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    marks DECIMAL(5,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_hash VARCHAR(64) NOT NULL UNIQUE,
    is_tampered BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sheet_id) REFERENCES answer_sheet_ids(sheet_id),
    INDEX idx_chain_sheet (sheet_id)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_timestamp (timestamp)
);

-- Login attempts for rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    ip_address VARCHAR(45),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    INDEX idx_login_email (email),
    INDEX idx_login_ip (ip_address)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Admin user (password: Admin@123 BCrypt hashed)
INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES
(1, 'System Admin', 'admin@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'ADMIN'),
(2, 'Controller of Examinations', 'coe@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'COE'),
(3, 'Dr. John Teacher', 'teacher@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'TEACHER'),
(4, 'Student One', 'student@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'STUDENT'),
(5, 'Dr. Sarah Smith', 'smith@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'TEACHER'),
(6, 'Dr. Robert AI', 'robert@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'TEACHER'),
(7, 'Alex Johnson', 'alex@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'STUDENT'),
(8, 'Maria Garcia', 'maria@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'STUDENT'),
(9, 'James Wilson', 'james@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'STUDENT'),
(10, 'Linda Brow', 'linda@saerp.com', '$2a$12$LQv3c1yqBWVHxkd0LL5QOOJqU9HJJo/HdKt5Kv.qQlhJm5P1Bvquy', 'STUDENT');

INSERT IGNORE INTO teachers (teacher_id, department) VALUES 
(3, 'Computer Science'),
(5, 'Computer Science'),
(6, 'Artificial Intelligence');

INSERT IGNORE INTO students (student_id, register_number, department, year) VALUES 
(4, '21AI101', 'Artificial Intelligence', 2),
(7, '21AI102', 'Artificial Intelligence', 2),
(8, '21CS101', 'Computer Science', 3),
(9, '21CS102', 'Computer Science', 3),
(10, '21CS103', 'Computer Science', 3);

INSERT IGNORE INTO subjects (subject_id, subject_name, subject_code, semester, department) VALUES
(1, 'Data Structures and Algorithms', 'CS301', 3, 'Computer Science'),
(2, 'Machine Learning', 'AI401', 4, 'Artificial Intelligence'),
(3, 'Database Management Systems', 'CS302', 3, 'Computer Science'),
(4, 'Deep Learning', 'AI402', 4, 'Artificial Intelligence'),
(5, 'Operating Systems', 'CS303', 3, 'Computer Science');
