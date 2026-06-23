package com.milkdelivery.billing.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventConsumer {

    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "delivery-marked", groupId = "billing-service-group")
    public void consumeDeliveryMarked(String message) {
        try {
            Map<String, Object> event = objectMapper.readValue(message, Map.class);
            log.info("Received delivery-marked event: {}", event);
        } catch (Exception e) {
            log.error("Failed to process delivery-marked event: {}", e.getMessage(), e);
        }
    }
}
