package com.vaxify.app.service;

public interface EmailService {
    void sendSimpleEmail(String to, String subject, String text);

    void sendHtmlEmail(String to, String subject, String htmlBody);
}
