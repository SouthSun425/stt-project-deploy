package com.stt.backendspring.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Spring Boot 서버 실행 중");
        return result;
    }

    @GetMapping("/api/test")
    public Map<String, Object> test() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "테스트 API 응답 성공");
        return result;
    }
}