package com.milkdelivery.notification.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.milkdelivery.notification.dto.OTPEvent;
import com.milkdelivery.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OTPSMSConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    @KafkaListener(topics = "otp-send-sms", groupId = "otp-notification-group")
    public void handleOTPEvent(String event) {
        log.info("Received OTP event: {}", event);
        try {
            OTPEvent otp = objectMapper.readValue(event, OTPEvent.class);
            // Log that we are sending SMS OTP
            log.info("Sending OTP SMS to {} via Twilio with code {}", otp.getUsername(), otp.getCode());
            // In a real implementation you would send SMS via Twilio here
            // Example: notificationService.sendSMS(otp.getUsername(), otp.getCode());
            // For now just log
        } catch (Exception e) {
            log.error("Failed to process OTP event", e);
        }
    }
}