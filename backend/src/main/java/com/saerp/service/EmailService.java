package com.saerp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:noreply@saerp.com}")
    private String fromEmail;

    @Async
    public void sendResultNotification(String toEmail, String studentName,
                                        String subjectName, String grade) {
        if (!mailEnabled) {
            log.info("Mail disabled. Would send to: {} grade={}", toEmail, grade);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("SAERP - Your Result is Published");
            message.setText(String.format(
                    "Dear %s,\n\nYour result for %s has been published.\nGrade: %s\n\n" +
                    "Login to the portal to view your full results.\n\nSAERP Team",
                    studentName, subjectName, grade));
            mailSender.send(message);
            log.info("Result email sent to {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }
}
