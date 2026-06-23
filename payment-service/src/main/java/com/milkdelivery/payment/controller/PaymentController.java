package com.milkdelivery.payment.controller;

import com.milkdelivery.payment.dto.request.PaymentRequest;
import com.milkdelivery.payment.dto.response.OutstandingResponse;
import com.milkdelivery.payment.dto.response.PaymentResponse;
import com.milkdelivery.payment.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/collect")
    public ResponseEntity<PaymentResponse> collectPayment(
            @Valid @RequestBody PaymentRequest request,
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        PaymentResponse response = paymentService.collectPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/history/{customerId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentHistory(
            @PathVariable Long customerId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (!"ADMIN".equalsIgnoreCase(role)
                && (userId == null || !userId.equals(String.valueOf(customerId)))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<PaymentResponse> history = paymentService.getPaymentHistory(customerId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/outstanding")
    public ResponseEntity<List<OutstandingResponse>> getOutstandingDues(
            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<OutstandingResponse> dues = paymentService.getOutstandingDues();
        return ResponseEntity.ok(dues);
    }
}
