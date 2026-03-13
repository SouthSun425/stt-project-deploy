package com.stt.backendspring.repository;

import com.stt.backendspring.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {

    long countByUserIdAndStatusAndCreatedAtBetween(
            Long userId,
            String status,
            LocalDateTime start,
            LocalDateTime end
    );
}