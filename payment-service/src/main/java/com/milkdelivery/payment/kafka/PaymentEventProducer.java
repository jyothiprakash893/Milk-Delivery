package com.milkdelivery.payment.kafka;

import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "payment-received";

    public void sendPaymentReceivedEvent(Long paymentId, Long billId, Long customerId,
                                         java.math.BigDecimal amountPaid, String paymentMode) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "PAYMENT_RECEIVED");
        event.put("paymentId", paymentId);
        event.put("billId", billId);
        event.put("customerId", customerId);
        event.put("amountPaid", amountPaid);
        event.put("paymentMode", paymentMode);
        event.put("timestamp", java.time.LocalDateTime.now().toString());

        kafkaTemplate.send(TOPIC, String.valueOf(billId), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Payment event sent successfully: topic={}, partition={}, offset={}",
                                TOPIC, result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset());
                    } else {
                        log.error("Failed to send payment event: {}", ex.getMessage(), ex);
                    }
                });
    }
}
