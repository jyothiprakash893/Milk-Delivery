package com.milkdelivery.customer.config;

import com.milkdelivery.customer.entity.Customer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaProducer {

    private static final String TOPIC = "customer-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendCustomerEvent(String eventType, Customer customer) {
        try {
            Map<String, Object> event = Map.of(
                    "eventType", eventType,
                    "customerId", customer.getId(),
                    "name", customer.getName(),
                    "phone", customer.getPhone(),
                    "status", customer.getStatus().name()
            );
            kafkaTemplate.send(TOPIC, String.valueOf(customer.getId()), event);
            log.info("Kafka event sent: {} for customer id: {}", eventType, customer.getId());
        } catch (Exception e) {
            log.error("Failed to send Kafka event: {}", e.getMessage());
        }
    }
}
