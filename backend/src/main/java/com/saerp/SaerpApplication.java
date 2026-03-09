package com.saerp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SaerpApplication {
    public static void main(String[] args) {
        SpringApplication.run(SaerpApplication.class, args);
    }
}
