package com.milkdelivery.delivery.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventProducer {

    private static final String TOPIC = "delivery-marked";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendDeliveryMarkedEvent(Long customerId, LocalDate deliveryDate, int quantity, boolean isDelivered) {
        Map<String, Object> event = new HashMap<>();
        event.put("customerId", customerId);
        event.put("deliveryDate", deliveryDate.toString());
        event.put("quantity", quantity);
        event.put("isDelivered", isDelivered);

        kafkaTemplate.send(TOPIC, String.valueOf(customerId), event);
        log.info("Published delivery-marked event for customer: {}", customerId);
    }
}
