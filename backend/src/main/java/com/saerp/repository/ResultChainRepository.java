package com.saerp.repository;

import com.saerp.entity.ResultChain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultChainRepository extends JpaRepository<ResultChain, Long> {
    Optional<ResultChain> findTopByOrderByBlockIdDesc();
    Optional<ResultChain> findByAnswerSheetSheetId(Long sheetId);
    List<ResultChain> findAllByOrderByBlockIdAsc();
}
