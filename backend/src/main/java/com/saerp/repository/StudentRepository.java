package com.saerp.repository;

import com.saerp.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRegisterNumber(String registerNumber);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE u.name LIKE %:name%")
    List<Student> findByStudentName(String name);
}
