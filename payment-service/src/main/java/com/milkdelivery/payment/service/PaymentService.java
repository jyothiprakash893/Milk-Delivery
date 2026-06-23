package com.milkdelivery.payment.service;

import com.milkdelivery.payment.dto.request.PaymentRequest;
import com.milkdelivery.payment.dto.response.OutstandingResponse;
import com.milkdelivery.payment.dto.response.PaymentResponse;
import com.milkdelivery.payment.entity.Payment;
import com.milkdelivery.payment.entity.Payment.PaymentMode;
import com.milkdelivery.payment.kafka.PaymentEventProducer;
import com.milkdelivery.payment.repository.PaymentRepository;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventProducer paymentEventProducer;
    private final RestTemplate restTemplate;

    @Value("${billing.service.url}")
    private String billingServiceUrl;

    @Transactional
    public PaymentResponse collectPayment(PaymentRequest request) {
        PaymentMode mode;
        try {
            mode = PaymentMode.valueOf(request.getPaymentMode().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid payment mode. Allowed: " + Arrays.toString(PaymentMode.values()));
        }

        Payment payment = Payment.builder()
                .billId(request.getBillId())
                .amountPaid(request.getAmountPaid())
                .paymentMode(mode)
                .notes(request.getNotes())
                .build();

        payment = paymentRepository.save(payment);

        paymentEventProducer.sendPaymentReceivedEvent(
                payment.getId(),
                payment.getBillId(),
                payment.getCustomerId(),
                payment.getAmountPaid(),
                payment.getPaymentMode().name()
        );

        return toResponse(payment);
    }

    public List<PaymentResponse> getPaymentHistory(Long customerId) {
        return paymentRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<OutstandingResponse> getOutstandingDues() {
        String url = billingServiceUrl + "/unpaid/summary";
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );

        List<Map<String, Object>> unpaidBills = response.getBody();
        if (unpaidBills == null || unpaidBills.isEmpty()) {
            return List.of();
        }

        Map<Long, List<Map<String, Object>>> groupedByCustomer = unpaidBills.stream()
                .collect(Collectors.groupingBy(
                        bill -> ((Number) bill.get("customerId")).longValue()
                ));

        return groupedByCustomer.entrySet().stream()
                .map(entry -> {
                    Long customerId = entry.getKey();
                    List<Map<String, Object>> bills = entry.getValue();

                    BigDecimal totalDue = bills.stream()
                            .map(bill -> new BigDecimal(bill.get("amountDue").toString()))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    String customerName = bills.stream()
                            .findFirst()
                            .map(bill -> (String) bill.get("customerName"))
                            .orElse("Unknown");

                    return OutstandingResponse.builder()
                            .customerId(customerId)
                            .customerName(customerName)
                            .totalDue(totalDue)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .billId(payment.getBillId())
                .customerId(payment.getCustomerId())
                .amountPaid(payment.getAmountPaid())
                .paymentDate(payment.getPaymentDate())
                .paymentMode(payment.getPaymentMode().name())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
