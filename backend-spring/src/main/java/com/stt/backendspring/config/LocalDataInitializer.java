package com.stt.backendspring.config;

import com.stt.backendspring.entity.User;
import com.stt.backendspring.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
@Profile("local")
public class LocalDataInitializer {

    @Value("${local.admin.email:}")
    private String adminEmail;

    @Value("${local.admin.password:}")
    private String adminPassword;

    @Bean
    CommandLineRunner createLocalAdmin(
            UserRepository users,
            BCryptPasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (adminEmail == null || adminEmail.isBlank()) {
                return;
            }

            User admin = users.findByEmail(adminEmail).orElseGet(() -> {
                if (adminPassword == null || adminPassword.isBlank()) {
                    throw new IllegalStateException(
                        "LOCAL_ADMIN_PASSWORD is required when creating a local admin."
                    );
                }
                User newAdmin = new User();
                newAdmin.setEmail(adminEmail);
                newAdmin.setPasswordHash(passwordEncoder.encode(adminPassword));
                return newAdmin;
            });

            admin.setAdmin(true);
            admin.setActive(true);
            admin.setCanUseStt(true);
            admin.setUnlimited(true);
            admin.setDailyLimit(999999);
            admin.setFailedLoginCount(0);
            admin.setAccountLocked(false);
            admin.setLockUntil(null);
            users.save(admin);

        };
    }
}
