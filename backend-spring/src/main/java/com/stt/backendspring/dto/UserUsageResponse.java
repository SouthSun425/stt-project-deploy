package com.stt.backendspring.dto;

public class UserUsageResponse {

    private String email;
    private int dailyLimit;
    private long todayUsedCount;
    private long remainingCount;
    private boolean canUseStt;
    private boolean unlimited;

    public UserUsageResponse() {
    }

    public UserUsageResponse(
            String email,
            int dailyLimit,
            long todayUsedCount,
            long remainingCount,
            boolean canUseStt,
            boolean unlimited
    ) {
        this.email = email;
        this.dailyLimit = dailyLimit;
        this.todayUsedCount = todayUsedCount;
        this.remainingCount = remainingCount;
        this.canUseStt = canUseStt;
        this.unlimited = unlimited;
    }

    public String getEmail() {
        return email;
    }

    public int getDailyLimit() {
        return dailyLimit;
    }

    public long getTodayUsedCount() {
        return todayUsedCount;
    }

    public long getRemainingCount() {
        return remainingCount;
    }

    public boolean isCanUseStt() {
        return canUseStt;
    }

    public boolean isUnlimited() {
        return unlimited;
    }
}