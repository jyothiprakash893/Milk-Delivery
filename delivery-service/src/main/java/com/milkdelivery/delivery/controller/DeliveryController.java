package com.milkdelivery.delivery.controller;

import com.milkdelivery.delivery.dto.response.DeliveryResponse;
import com.milkdelivery.delivery.dto.response.MessageResponse;
import com.milkdelivery.delivery.dto.response.MonthlyReportResponse;
import com.milkdelivery.delivery.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/today")
    public ResponseEntity<List<DeliveryResponse>> getTodayDeliveries() {
        return ResponseEntity.ok(deliveryService.getTodayDeliveries());
    }

    @PutMapping("/mark/{customerId}")
    public ResponseEntity<DeliveryResponse> markDelivered(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        return ResponseEntity.ok(deliveryService.markDelivered(customerId, quantity));
    }

    @PutMapping("/skip/{customerId}")
    public ResponseEntity<DeliveryResponse> markSkipped(
            @PathVariable Long customerId,
            @RequestParam String reason) {
        return ResponseEntity.ok(deliveryService.markSkipped(customerId, reason));
    }

    @GetMapping("/history/{customerId}")
    public ResponseEntity<List<DeliveryResponse>> getCustomerHistory(@PathVariable Long customerId) {
        return ResponseEntity.ok(deliveryService.getCustomerHistory(customerId));
    }

    @GetMapping("/report/{month}/{year}")
    public ResponseEntity<MonthlyReportResponse> getMonthlyReport(
            @PathVariable int month,
            @PathVariable int year) {
        return ResponseEntity.ok(deliveryService.getMonthlyReport(month, year));
    }
}
