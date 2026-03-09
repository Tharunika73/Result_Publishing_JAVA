package com.saerp.util;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Component
public class HashUtil {

    public static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    public String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    public String computeBlockHash(String previousHash, Long sheetId, Long teacherId,
                                    String marks, String timestamp) {
        String rawData = previousHash + "|" + sheetId + "|" + teacherId + "|" + marks + "|" + timestamp;
        return sha256(rawData);
    }

    public boolean verifyBlockHash(String expectedHash, String previousHash, Long sheetId,
                                    Long teacherId, String marks, String timestamp) {
        String computed = computeBlockHash(previousHash, sheetId, teacherId, marks, timestamp);
        return computed.equals(expectedHash);
    }
}
