package com.stt.backendspring.dto;

import java.util.HashMap;
import java.util.Map;

public class LoginResponse {

    private boolean success;
    private String message;
    private String accessToken;
    private String tokenType;
    private Map<String, Object> user;

    public LoginResponse() {
    }

    public static LoginResponse of(
            String message,
            String accessToken,
            String email,
            boolean isAdmin,
            boolean isActive,
            boolean canUseStt,
            boolean isUnlimited,
            int dailyLimit
    ) {
        LoginResponse response = new LoginResponse();
        response.success = true;
        response.message = message;
        response.accessToken = accessToken;
        response.tokenType = "Bearer";

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("email", email);
        userMap.put("isAdmin", isAdmin);
        userMap.put("isActive", isActive);
        userMap.put("canUseStt", canUseStt);
        userMap.put("isUnlimited", isUnlimited);
        userMap.put("dailyLimit", dailyLimit);

        response.user = userMap;
        return response;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public Map<String, Object> getUser() {
        return user;
    }
}