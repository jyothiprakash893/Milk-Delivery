package com.milkdelivery.delivery.service;

import com.milkdelivery.delivery.dto.response.DeliveryResponse;
import com.milkdelivery.delivery.dto.response.MonthlyReportResponse;
import com.milkdelivery.delivery.entity.Delivery;
import com.milkdelivery.delivery.kafka.DeliveryEventProducer;
import com.milkdelivery.delivery.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final RestTemplate restTemplate;
    private final DeliveryEventProducer eventProducer;

    @Value("${customer.service.url}")
    private String customerServiceUrl;

    public List<DeliveryResponse> getTodayDeliveries() {
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> customers = fetchAllCustomers();
        List<Delivery> todayDeliveries = deliveryRepository.findByDeliveryDate(today);
        Map<Long, Delivery> deliveryMap = todayDeliveries.stream()
                .collect(Collectors.toMap(Delivery::getCustomerId, d -> d));

        return customers.stream()
                .map(customer -> {
                    Long customerId = ((Number) customer.get("id")).longValue();
                    Delivery delivery = deliveryMap.get(customerId);
                    return buildDeliveryResponse(customer, delivery, today);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponse markDelivered(Long customerId, Integer quantity) {
        LocalDate today = LocalDate.now();
        Delivery delivery = deliveryRepository.findByCustomerIdAndDeliveryDate(customerId, today)
                .orElse(new Delivery());

        delivery.setCustomerId(customerId);
        delivery.setDeliveryDate(today);
        delivery.setQuantity(quantity);
        delivery.setIsDelivered(true);
        delivery.setSkipReason(null);
        delivery.setMarkedAt(LocalDateTime.now());

        delivery = deliveryRepository.save(delivery);

        eventProducer.sendDeliveryMarkedEvent(customerId, today, quantity, true);

        Map<String, Object> customer = fetchCustomerById(customerId);
        return buildDeliveryResponse(customer, delivery, today);
    }

    @Transactional
    public DeliveryResponse markSkipped(Long customerId, String reason) {
        LocalDate today = LocalDate.now();
        Delivery delivery = deliveryRepository.findByCustomerIdAndDeliveryDate(customerId, today)
                .orElse(new Delivery());

        delivery.setCustomerId(customerId);
        delivery.setDeliveryDate(today);
        delivery.setQuantity(0);
        delivery.setIsDelivered(false);
        delivery.setSkipReason(reason);
        delivery.setMarkedAt(LocalDateTime.now());

        delivery = deliveryRepository.save(delivery);

        eventProducer.sendDeliveryMarkedEvent(customerId, today, 0, false);

        Map<String, Object> customer = fetchCustomerById(customerId);
        return buildDeliveryResponse(customer, delivery, today);
    }

    public List<DeliveryResponse> getCustomerHistory(Long customerId) {
        List<Delivery> deliveries = deliveryRepository.findByCustomerId(customerId);
        Map<String, Object> customer = fetchCustomerById(customerId);

        return deliveries.stream()
                .sorted((a, b) -> b.getDeliveryDate().compareTo(a.getDeliveryDate()))
                .map(delivery -> buildDeliveryResponse(customer, delivery, delivery.getDeliveryDate()))
                .collect(Collectors.toList());
    }

    public MonthlyReportResponse getMonthlyReport(int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Delivery> deliveries = deliveryRepository.findByDeliveryDateBetween(start, end);
        Map<String, Object> customerCache = new HashMap<>();

        long deliveredCount = deliveries.stream().filter(Delivery::getIsDelivered).count();
        long skippedCount = deliveries.size() - deliveredCount;

        List<DeliveryResponse> deliveryResponses = deliveries.stream()
                .sorted((a, b) -> b.getDeliveryDate().compareTo(a.getDeliveryDate()))
                .map(delivery -> {
                    Map<String, Object> customer = customerCache.computeIfAbsent(
                            String.valueOf(delivery.getCustomerId()),
                            k -> fetchCustomerById(delivery.getCustomerId())
                    );
                    return buildDeliveryResponse(customer, delivery, delivery.getDeliveryDate());
                })
                .collect(Collectors.toList());

        return MonthlyReportResponse.builder()
                .month(month)
                .year(year)
                .totalDeliveries(deliveries.size())
                .deliveredCount(deliveredCount)
                .skippedCount(skippedCount)
                .deliveries(deliveryResponses)
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchAllCustomers() {
        try {
            String url = customerServiceUrl;
            return restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            ).getBody();
        } catch (Exception e) {
            log.error("Failed to fetch customers from customer-service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchCustomerById(Long customerId) {
        try {
            String url = customerServiceUrl + "/" + customerId;
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.error("Failed to fetch customer {} from customer-service: {}", customerId, e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("id", customerId);
            fallback.put("name", "Unknown");
            fallback.put("address", "N/A");
            fallback.put("phone", "N/A");
            return fallback;
        }
    }

    private DeliveryResponse buildDeliveryResponse(Map<String, Object> customer, Delivery delivery, LocalDate date) {
        DeliveryResponse.DeliveryResponseBuilder builder = DeliveryResponse.builder()
                .customerId(((Number) customer.get("id")).longValue())
                .customerName((String) customer.getOrDefault("name", "Unknown"))
                .customerAddress((String) customer.getOrDefault("address", "N/A"))
                .customerPhone((String) customer.getOrDefault("phone", "N/A"))
                .deliveryDate(date);

        if (delivery != null && delivery.getId() != null) {
            builder.id(delivery.getId())
                    .quantity(delivery.getQuantity())
                    .isDelivered(delivery.getIsDelivered())
                    .skipReason(delivery.getSkipReason())
                    .markedAt(delivery.getMarkedAt());
        } else {
            builder.id(null)
                    .quantity(0)
                    .isDelivered(false)
                    .skipReason(null)
                    .markedAt(null);
        }

        return builder.build();
    }
}
