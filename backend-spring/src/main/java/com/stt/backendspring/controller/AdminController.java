package com.stt.backendspring.controller;

import com.stt.backendspring.dto.AdminUserResponse;
import com.stt.backendspring.dto.UserUsageResponse;
import com.stt.backendspring.entity.User;
import com.stt.backendspring.repository.UsageLogRepository;
import com.stt.backendspring.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final UsageLogRepository usageLogRepository;

    public AdminController(UserRepository userRepository, UsageLogRepository usageLogRepository) {
        this.userRepository = userRepository;
        this.usageLogRepository = usageLogRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestParam(value = "keyword", required = false) String keyword) {
        List<User> users = userRepository.findAll();

        if (keyword != null && !keyword.isBlank()) {
            String lowerKeyword = keyword.trim().toLowerCase();
            users = users.stream()
                    .filter(user -> user.getEmail() != null && user.getEmail().toLowerCase().contains(lowerKeyword))
                    .collect(Collectors.toList());
        }

        List<AdminUserResponse> result = users.stream()
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/usage")
    public ResponseEntity<?> getUsageList(@RequestParam(value = "keyword", required = false) String keyword) {
        List<User> users = userRepository.findAll();

        if (keyword != null && !keyword.isBlank()) {
            String lowerKeyword = keyword.trim().toLowerCase();
            users = users.stream()
                    .filter(user -> user.getEmail() != null && user.getEmail().toLowerCase().contains(lowerKeyword))
                    .collect(Collectors.toList());
        }

        List<UserUsageResponse> result = users.stream()
                .map(this::toUsageResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/users/enable")
    public ResponseEntity<Map<String, Object>> enableUser(@RequestBody Map<String, String> request) {
        Map<String, Object> result = new HashMap<>();
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            result.put("success", false);
            result.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.badRequest().body(result);
        }

        user.setCanUseStt(true);
        userRepository.save(user);

        result.put("success", true);
        result.put("message", "사용자 STT 승인 완료");
        result.put("email", user.getEmail());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users/disable")
    public ResponseEntity<Map<String, Object>> disableUser(@RequestBody Map<String, String> request) {
        Map<String, Object> result = new HashMap<>();
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            result.put("success", false);
            result.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.badRequest().body(result);
        }

        user.setCanUseStt(false);
        userRepository.save(user);

        result.put("success", true);
        result.put("message", "사용자 STT 차단 완료");
        result.put("email", user.getEmail());
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/users/daily-limit")
    public ResponseEntity<Map<String, Object>> updateDailyLimit(@RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();

        String email = (String) request.get("email");
        Object dailyLimitObj = request.get("dailyLimit");

        if (email == null || email.isBlank()) {
            result.put("success", false);
            result.put("message", "이메일은 필수입니다.");
            return ResponseEntity.badRequest().body(result);
        }

        if (dailyLimitObj == null) {
            result.put("success", false);
            result.put("message", "일일 한도는 필수입니다.");
            return ResponseEntity.badRequest().body(result);
        }

        int dailyLimit;
        try {
            dailyLimit = Integer.parseInt(String.valueOf(dailyLimitObj));
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "일일 한도는 숫자여야 합니다.");
            return ResponseEntity.badRequest().body(result);
        }

        if (dailyLimit < 1) {
            result.put("success", false);
            result.put("message", "일일 한도는 1 이상이어야 합니다.");
            return ResponseEntity.badRequest().body(result);
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            result.put("success", false);
            result.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.badRequest().body(result);
        }

        user.setDailyLimit(dailyLimit);
        userRepository.save(user);

        result.put("success", true);
        result.put("message", "일일 한도 수정 완료");
        result.put("email", user.getEmail());
        result.put("dailyLimit", user.getDailyLimit());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/users/unlock")
    public ResponseEntity<Map<String, Object>> unlockUser(@RequestBody Map<String, String> request) {
        Map<String, Object> result = new HashMap<>();
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            result.put("success", false);
            result.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.badRequest().body(result);
        }

        user.setAccountLocked(false);
        user.setFailedLoginCount(0);
        user.setLockUntil(null);
        userRepository.save(user);

        result.put("success", true);
        result.put("message", "사용자 잠금 해제 완료");
        result.put("email", user.getEmail());
        return ResponseEntity.ok(result);
    }

    private UserUsageResponse toUsageResponse(User user) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);

        long todayUsedCount = usageLogRepository.countByUserIdAndStatusAndCreatedAtBetween(
                user.getId(),
                "success",
                start,
                end
        );

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