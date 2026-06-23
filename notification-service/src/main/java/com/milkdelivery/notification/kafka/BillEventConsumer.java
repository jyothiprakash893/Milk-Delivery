package com.milkdelivery.notification.kafka;

import com.milkdelivery.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class BillEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(BillEventConsumer.class);

    private final NotificationService notificationService;

    public BillEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "bill-generated", groupId = "notification-group")
    public void consumeBillEvent(String message) {
        log.info("Received bill-generated event: {}", message);

        try {
            Long customerId = extractCustomerId(message);
            notificationService.sendBillNotification(customerId, "Your bill has been generated: " + message);
        } catch (Exception e) {
            log.error("Failed to process bill event: {}", message, e);
        }
    }

    private Long extractCustomerId(String message) {
        if (message != null && message.contains(":")) {
            String[] parts = message.split(":", 2);
            return Long.parseLong(parts[0].trim());
        }
        return 0L;
    }
}
