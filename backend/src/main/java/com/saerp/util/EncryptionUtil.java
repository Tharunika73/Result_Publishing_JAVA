package com.saerp.util;

import java.util.UUID;

public class EncryptionUtil {
    
    public static String encryptStudentId(Long studentId) {
        // Simple XOR-based encryption with salt for anonymity
        String salt = UUID.randomUUID().toString();
        return salt + ":" + (studentId ^ 0xDEADBEEFL);
    }

    public static Long decryptStudentId(String encrypted) {
        try {
            String[] parts = encrypted.split(":");
            return Long.parseLong(parts[1]) ^ 0xDEADBEEFL;
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt student ID", e);
        }
    }

    public static String generateRandomScriptCode() {
        String code = "S" + System.nanoTime();
        return code.substring(0, 8);
    }
}
