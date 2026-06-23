package com.milkdelivery.billing.kafka;

import com.milkdelivery.billing.dto.response.BillResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BillingEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "bill-generated";

    public void publishBillGenerated(BillResponse bill) {
        try {
            kafkaTemplate.send(TOPIC, bill.getCustomerId().toString(), bill);
            log.info("Published bill-generated event for customer {}", bill.getCustomerId());
        } catch (Exception e) {
            log.error("Failed to publish bill-generated event: {}", e.getMessage(), e);
        }
    }
}
