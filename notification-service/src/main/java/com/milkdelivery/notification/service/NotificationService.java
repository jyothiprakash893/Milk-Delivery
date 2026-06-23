package com.milkdelivery.notification.service;

import com.milkdelivery.notification.dto.request.NotificationRequest;
import com.milkdelivery.notification.entity.NotificationLog;
import com.milkdelivery.notification.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationLogRepository notificationLogRepository;
    private final AtomicLong idCounter = new AtomicLong(1);

    public NotificationService(NotificationLogRepository notificationLogRepository) {
        this.notificationLogRepository = notificationLogRepository;
    }

    public void sendBillNotification(Long customerId, String message) {
        log.info("--- SENDING BILL NOTIFICATION ---");
        log.info("Customer ID: {}", customerId);
        log.info("Message: {}", message);
        log.info("Channel: SMS (Twilio)");
        log.info("---------------------------------");
        logNotification(customerId, "SMS", message, "SENT");
    }

    public void sendPaymentReminder(Long customerId, String message) {
        log.info("--- SENDING PAYMENT REMINDER ---");
        log.info("Customer ID: {}", customerId);
        log.info("Message: {}", message);
        log.info("Channel: SMS (Twilio)");
        log.info("----------------------------------");
        logNotification(customerId, "SMS", message, "SENT");
    }

    public void sendCustomMessage(Long customerId, String message, String type) {
        log.info("--- SENDING CUSTOM {} ---", type);
        log.info("Customer ID: {}", customerId);
        log.info("Message: {}", message);
        log.info("Channel: {}", type);

        if ("SMS".equalsIgnoreCase(type) || "WHATSAPP".equalsIgnoreCase(type)) {
            log.info("Provider: Twilio");
        } else if ("EMAIL".equalsIgnoreCase(type)) {
            log.info("Provider: SendGrid");
        }

        log.info("---------------------------");
        logNotification(customerId, type, message, "SENT");
    }

    private void logNotification(Long customerId, String type, String message, String status) {
        NotificationLog notificationLog = new NotificationLog(
                idCounter.getAndIncrement(),
                customerId,
                type.toUpperCase(),
                message,
                LocalDateTime.now(),
                status
        );
        notificationLogRepository.save(notificationLog);
        log.info("Notification logged to store with id: {}", notificationLog.getId());
    }

    public List<NotificationLog> getAllLogs() {
        return notificationLogRepository.findAll();
    }
}
