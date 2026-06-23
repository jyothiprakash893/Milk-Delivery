package com.milkdelivery.notification.kafka;

import com.milkdelivery.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventConsumer.class);

    private final NotificationService notificationService;

    public PaymentEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "payment-received", groupId = "notification-group")
    public void consumePaymentEvent(String message) {
        log.info("Received payment-received event: {}", message);

        try {
            Long customerId = extractCustomerId(message);
            notificationService.sendCustomMessage(
                    customerId,
                    "Thank you! Your payment has been received successfully: " + message,
                    "SMS"
            );
        } catch (Exception e) {
            log.error("Failed to process payment event: {}", message, e);
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
