package com.saerp.service;

import com.saerp.entity.AuditLog;
import com.saerp.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(Long userId, String action, String resourceType, String resourceId,
                    String ipAddress, String userAgent, String details) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAllLogs(int page, int size) {
        return auditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size));
    }

    public Page<AuditLog> getLogsByUser(Long userId, int page, int size) {
        return auditLogRepository.findByUserId(userId, PageRequest.of(page, size));
    }
}
