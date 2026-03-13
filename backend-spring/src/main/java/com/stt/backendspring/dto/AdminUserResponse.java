package com.stt.backendspring.dto;

import com.stt.backendspring.entity.User;

public class AdminUserResponse {

    private Long id;
    private String email;
    private boolean admin;
    private boolean active;
    private boolean canUseStt;
    private boolean unlimited;
    private int dailyLimit;
    private int failedLoginCount;
    private boolean accountLocked;
    private String lockUntil;

    public AdminUserResponse() {
    }

    public static AdminUserResponse from(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.id = user.getId();
        response.email = user.getEmail();
        response.admin = user.isAdmin();
        response.active = user.isActive();
        response.canUseStt = user.isCanUseStt();
        response.unlimited = user.isUnlimited();
        response.dailyLimit = user.getDailyLimit();
        response.failedLoginCount = user.getFailedLoginCount();
        response.accountLocked = user.isAccountLocked();
        response.lockUntil = user.getLockUntil() == null ? null : user.getLockUntil().toString();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public boolean isAdmin() {
        return admin;
    }

    public boolean isActive() {
        return active;
    }

    public boolean isCanUseStt() {
        return canUseStt;
    }

    public boolean isUnlimited() {
        return unlimited;
    }

    public int getDailyLimit() {
        return dailyLimit;
    }

    public int getFailedLoginCount() {
        return failedLoginCount;
    }

    public boolean isAccountLocked() {
        return accountLocked;
    }

    public String getLockUntil() {
        return lockUntil;
    }
}