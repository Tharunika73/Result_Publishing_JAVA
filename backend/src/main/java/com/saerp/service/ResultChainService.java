package com.saerp.service;

import com.saerp.dto.ExamDtos;
import com.saerp.entity.*;
import com.saerp.repository.*;
import com.saerp.util.HashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResultChainService {

    private final ResultChainRepository chainRepository;
    private final HashUtil hashUtil;

    @Transactional
    public ResultChain createBlock(AnswerSheetId sheet, Long teacherId, java.math.BigDecimal marks) {
        ResultChain lastBlock = chainRepository.findTopByOrderByBlockIdDesc().orElse(null);
        String previousHash = lastBlock != null ? lastBlock.getCurrentHash() : HashUtil.GENESIS_HASH;

        java.time.LocalDateTime timestamp = java.time.LocalDateTime.now();
        String currentHash = hashUtil.computeBlockHash(
                previousHash,
                sheet.getSheetId(),
                teacherId,
                marks.toString(),
                timestamp.toString()
        );

        ResultChain block = ResultChain.builder()
                .previousHash(previousHash)
                .answerSheet(sheet)
                .teacherId(teacherId)
                .marks(marks)
                .timestamp(timestamp)
                .currentHash(currentHash)
                .isTampered(false)
                .build();

        return chainRepository.save(block);
    }

    public boolean verifyChainIntegrity() {
        List<ResultChain> blocks = chainRepository.findAllByOrderByBlockIdAsc();
        if (blocks.isEmpty()) return true;

        // Check genesis block
        ResultChain first = blocks.get(0);
        String expectedPrevious = first.getPreviousHash();
        if (!expectedPrevious.equals(HashUtil.GENESIS_HASH) && !isValidPreviousHash(blocks, first)) {
            return false;
        }

        // Verify each block's hash
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSSSSS");
        for (ResultChain block : blocks) {
            String recomputed = hashUtil.computeBlockHash(
                    block.getPreviousHash(),
                    block.getAnswerSheet().getSheetId(),
                    block.getTeacherId(),
                    block.getMarks().toString(),
                    block.getTimestamp().toString()
            );
            if (!recomputed.equals(block.getCurrentHash())) {
                block.setIsTampered(true);
                chainRepository.save(block);
                log.warn("TAMPER DETECTED at block_id={}", block.getBlockId());
                return false;
            }
        }
        return true;
    }

    private boolean isValidPreviousHash(List<ResultChain> blocks, ResultChain current) {
        int idx = blocks.indexOf(current);
        if (idx == 0) return true;
        return blocks.get(idx - 1).getCurrentHash().equals(current.getPreviousHash());
    }

    public List<ExamDtos.ChainBlockDTO> getAllBlocks() {
        return chainRepository.findAllByOrderByBlockIdAsc().stream()
                .map(b -> ExamDtos.ChainBlockDTO.builder()
                        .blockId(b.getBlockId())
                        .previousHash(b.getPreviousHash())
                        .randomCode(b.getAnswerSheet().getRandomCode())
                        .teacherId(b.getTeacherId())
                        .marks(b.getMarks())
                        .timestamp(b.getTimestamp().toString())
                        .currentHash(b.getCurrentHash())
                        .tampered(Boolean.TRUE.equals(b.getIsTampered()))
                        .build())
                .collect(Collectors.toList());
    }
}
