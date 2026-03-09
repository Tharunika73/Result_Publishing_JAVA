package com.saerp.repository;

import com.saerp.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByStudentStudentId(Long studentId);

    @Query("SELECT r FROM Result r WHERE r.student.user.name LIKE %:name% OR r.student.registerNumber LIKE %:name%")
    List<Result> searchByStudentNameOrRegister(String name);
}
