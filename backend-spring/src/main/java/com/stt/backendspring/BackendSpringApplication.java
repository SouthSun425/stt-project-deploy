package com.stt.backendspring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
        "com.stt.backendspring.health"
})
public class BackendSpringApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendSpringApplication.class, args);
    }
}