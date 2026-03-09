package com.saerp.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@Slf4j
public class AesEncryptionUtil {

    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String KEY_ALGORITHM = "AES";

    @Value("${aes.secret}")
    private String aesSecret;

    @Value("${aes.iv}")
    private String aesIv;

    private SecretKeySpec getSecretKey() {
        byte[] keyBytes = aesSecret.getBytes(StandardCharsets.UTF_8);
        byte[] paddedKey = new byte[32]; // AES-256
        System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 32));
        return new SecretKeySpec(paddedKey, KEY_ALGORITHM);
    }

    private IvParameterSpec getIvSpec() {
        byte[] ivBytes = aesIv.getBytes(StandardCharsets.UTF_8);
        byte[] paddedIv = new byte[16];
        System.arraycopy(ivBytes, 0, paddedIv, 0, Math.min(ivBytes.length, 16));
        return new IvParameterSpec(paddedIv);
    }

    public String encrypt(String plainText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(), getIvSpec());
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            log.error("Encryption error: {}", e.getMessage());
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(String cipherText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), getIvSpec());
            byte[] decoded = Base64.getDecoder().decode(cipherText);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Decryption error: {}", e.getMessage());
            throw new RuntimeException("Decryption failed", e);
        }
    }
}
