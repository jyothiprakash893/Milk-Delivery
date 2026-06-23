package com.milkdelivery.notification.controller;

import com.milkdelivery.notification.dto.request.NotificationRequest;
import com.milkdelivery.notification.dto.response.MessageResponse;
import com.milkdelivery.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/send-bills")
    public ResponseEntity<MessageResponse> sendBillNotification(@Valid @RequestBody NotificationRequest request) {
        notificationService.sendBillNotification(request.getCustomerId(), request.getMessage());
        return ResponseEntity.ok(MessageResponse.ok("Bill notification sent successfully"));
    }

    @PostMapping("/reminder")
    public ResponseEntity<MessageResponse> sendPaymentReminder(@Valid @RequestBody NotificationRequest request) {
        notificationService.sendPaymentReminder(request.getCustomerId(), request.getMessage());
        return ResponseEntity.ok(MessageResponse.ok("Payment reminder sent successfully"));
    }

    @PostMapping("/custom")
    public ResponseEntity<MessageResponse> sendCustomMessage(@Valid @RequestBody NotificationRequest request) {
        notificationService.sendCustomMessage(request.getCustomerId(), request.getMessage(), request.getType());
        return ResponseEntity.ok(MessageResponse.ok("Custom message sent successfully"));
    }
}
