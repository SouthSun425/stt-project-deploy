package com.stt.backendspring.controller;

import com.stt.backendspring.config.JwtTokenProvider;
import com.stt.backendspring.dto.LoginRequest;
import com.stt.backendspring.dto.LoginResponse;
import com.stt.backendspring.dto.SignupRequest;
import com.stt.backendspring.entity.User;
import com.stt.backendspring.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final int MAX_LOGIN_FAIL_COUNT = 5;
    private static final int LOCK_MINUTES = 10;

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${signup.allowed-domains:}")
    private String allowedDomainsRaw;

    public AuthController(
        UserRepository userRepository,
        BCryptPasswordEncoder passwordEncoder,
        JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignupRequest request) {
        Map<String, Object> result = new HashMap<>();

        if (userRepository.existsByEmail(request.getEmail())) {
            result.put("success", false);
            result.put("message", "회원가입에 실패했습니다.");
            return ResponseEntity.badRequest().body(result);
        }

        if (!isAllowedDomain(request.getEmail())) {
            result.put("success", false);
            result.put("message", "회원가입이 허용되지 않은 이메일입니다.");
            return ResponseEntity.badRequest().body(result);
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setAdmin(false);
        user.setActive(true);
        user.setCanUseStt(false);
        user.setUnlimited(false);
        user.setDailyLimit(10);
        user.setFailedLoginCount(0);
        user.setAccountLocked(false);
        user.setLockUntil(null);

        userRepository.save(user);

        result.put("success", true);
        result.put("message", "회원가입 완료");
        result.put("email", user.getEmail());
        result.put("notice", "관리자 승인 전까지 STT 사용은 불가합니다.");

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> result = new HashMap<>();

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            result.put("success", false);
            result.put("message", "이메일 또는 비밀번호가 올바르지 않습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }

        User user = optionalUser.get();

        if (user.isAccountLocked()) {
            if (user.getLockUntil() != null && LocalDateTime.now().isBefore(user.getLockUntil())) {
                result.put("success", false);
                result.put("message", "로그인할 수 없습니다. 잠시 후 다시 시도해주세요.");
                return ResponseEntity.status(HttpStatus.LOCKED).body(result);
            } else {
                user.setAccountLocked(false);
                user.setLockUntil(null);
                user.setFailedLoginCount(0);
                userRepository.save(user);
            }
        }

        if (!user.isActive()) {
            result.put("success", false);
            result.put("message", "로그인할 수 없습니다.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int failCount = user.getFailedLoginCount() + 1;
            user.setFailedLoginCount(failCount);

            if (failCount >= MAX_LOGIN_FAIL_COUNT) {
                user.setAccountLocked(true);
                user.setLockUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
            }

            userRepository.save(user);

            result.put("success", false);
            result.put("message", "이메일 또는 비밀번호가 올바르지 않습니다.");

            if (failCount >= MAX_LOGIN_FAIL_COUNT) {
                return ResponseEntity.status(HttpStatus.LOCKED).body(result);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }

        user.setFailedLoginCount(0);
        user.setAccountLocked(false);
        user.setLockUntil(null);
        userRepository.save(user);

        String token = jwtTokenProvider.createToken(user.getEmail(), user.isAdmin());

        return ResponseEntity.ok(
            LoginResponse.of(
                "로그인 성공",
                token,
                user.getEmail(),
                user.isAdmin(),
                user.isActive(),
                user.isCanUseStt(),
                user.isUnlimited(),
                user.getDailyLimit()
            )
        );
    }

    private boolean isAllowedDomain(String email) {
        if (allowedDomainsRaw == null || allowedDomainsRaw.isBlank()) {
            return false;
        }

        int atIndex = email.lastIndexOf("@");
        if (atIndex < 0 || atIndex == email.length() - 1) {
            return false;
        }

        String domain = email.substring(atIndex + 1).toLowerCase();

        Set<String> allowedDomains = Arrays.stream(allowedDomainsRaw.split(","))
            .map(String::trim)
            .filter(s -> !s.isBlank())
            .map(String::toLowerCase)
            .collect(Collectors.toSet());

        return allowedDomains.contains(domain);
    }
}