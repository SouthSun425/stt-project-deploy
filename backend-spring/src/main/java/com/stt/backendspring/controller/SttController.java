package com.stt.backendspring.controller;

import com.stt.backendspring.dto.UserUsageResponse;
import com.stt.backendspring.entity.UsageLog;
import com.stt.backendspring.entity.User;
import com.stt.backendspring.repository.UsageLogRepository;
import com.stt.backendspring.repository.UserRepository;
import com.stt.backendspring.service.FastApiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stt")
public class SttController {

    private final FastApiService fastApiService;
    private final UserRepository userRepository;
    private final UsageLogRepository usageLogRepository;

    public SttController(
            FastApiService fastApiService,
            UserRepository userRepository,
            UsageLogRepository usageLogRepository
    ) {
        this.fastApiService = fastApiService;
        this.userRepository = userRepository;
        this.usageLogRepository = usageLogRepository;
    }

    @GetMapping("/usage")
    public ResponseEntity<?> getMyUsage(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(buildUsageResponse(user));
    }

    @PostMapping(value = "/process", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> processAudio(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        Map<String, Object> result = new HashMap<>();
        User user = getCurrentUser(authentication);

        try {
            if (file.isEmpty()) {
                result.put("success", false);
                result.put("message", "파일이 비어 있습니다.");
                return ResponseEntity.badRequest().body(result);
            }

            if (!user.isCanUseStt()) {
                result.put("success", false);
                result.put("message", "현재 STT 사용 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
            }

            if (!user.isUnlimited()) {
                long todayUsedCount = getTodayUsedCount(user.getId());
                if (todayUsedCount >= user.getDailyLimit()) {
                    result.put("success", false);
                    result.put("message", "오늘 사용 한도를 초과했습니다.");
                    result.put("dailyLimit", user.getDailyLimit());
                    result.put("todayUsedCount", todayUsedCount);
                    result.put("remainingCount", 0);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
                }
            }

            Map<String, Object> fastApiResult = fastApiService.processAudio(file);

            UsageLog usageLog = new UsageLog();
            usageLog.setUserId(user.getId());
            usageLog.setFileName(file.getOriginalFilename());
            usageLog.setStatus("success");
            usageLogRepository.save(usageLog);

            long updatedTodayUsedCount = getTodayUsedCount(user.getId());
            long remainingCount = user.isUnlimited()
                    ? 999999
                    : Math.max(0, user.getDailyLimit() - updatedTodayUsedCount);

            fastApiResult.put("todayUsedCount", updatedTodayUsedCount);
            fastApiResult.put("remainingCount", remainingCount);
            fastApiResult.put("dailyLimit", user.getDailyLimit());

            return ResponseEntity.ok(fastApiResult);

        } catch (Exception e) {
            UsageLog usageLog = new UsageLog();
            usageLog.setUserId(user.getId());
            usageLog.setFileName(file.getOriginalFilename());
            usageLog.setStatus("failed");
            usageLogRepository.save(usageLog);

            result.put("success", false);
            result.put("message", "STT 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private long getTodayUsedCount(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);

        return usageLogRepository.countByUserIdAndStatusAndCreatedAtBetween(
                userId,
                "success",
                start,
                end
        );
    }

    private UserUsageResponse buildUsageResponse(User user) {
        long todayUsedCount = getTodayUsedCount(user.getId());
        long remainingCount = user.isUnlimited()
                ? 999999
                : Math.max(0, user.getDailyLimit() - todayUsedCount);

        return new UserUsageResponse(
                user.getEmail(),
                user.getDailyLimit(),
                todayUsedCount,
                remainingCount,
                user.isCanUseStt(),
                user.isUnlimited()
        );
    }
}