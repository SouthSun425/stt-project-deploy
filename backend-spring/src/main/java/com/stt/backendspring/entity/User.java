package com.stt.backendspring.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "is_admin", nullable = false)
    private boolean isAdmin = false;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "can_use_stt", nullable = false)
    private boolean canUseStt = false;

    @Column(name = "is_unlimited", nullable = false)
    private boolean isUnlimited = false;

    @Column(name = "daily_limit", nullable = false)
    private int dailyLimit = 10;

    @Column(name = "failed_login_count", nullable = false)
    private int failedLoginCount = 0;

    @Column(name = "account_locked", nullable = false)
    private boolean accountLocked = false;

    @Column(name = "lock_until")
    private LocalDateTime lockUntil;

    public User() {
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public boolean isActive() {
        return isActive;
    }

    public boolean isCanUseStt() {
        return canUseStt;
    }

    public boolean isUnlimited() {
        return isUnlimited;
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

    public LocalDateTime getLockUntil() {
        return lockUntil;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public void setCanUseStt(boolean canUseStt) {
        this.canUseStt = canUseStt;
    }

    public void setUnlimited(boolean unlimited) {
        isUnlimited = unlimited;
    }

    public void setDailyLimit(int dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    public void setFailedLoginCount(int failedLoginCount) {
        this.failedLoginCount = failedLoginCount;
    }

    public void setAccountLocked(boolean accountLocked) {
        this.accountLocked = accountLocked;
    }

    public void setLockUntil(LocalDateTime lockUntil) {
        this.lockUntil = lockUntil;
    }
}