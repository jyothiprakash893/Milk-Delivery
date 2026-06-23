package com.milkdelivery.customer.controller;

import com.milkdelivery.customer.dto.request.ServiceRequestRequest;
import com.milkdelivery.customer.dto.response.MessageResponse;
import com.milkdelivery.customer.dto.response.ServiceRequestResponse;
import com.milkdelivery.customer.entity.ServiceRequest.RequestStatus;
import com.milkdelivery.customer.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @GetMapping("/all")
    public ResponseEntity<List<ServiceRequestResponse>> getAll() {
        return ResponseEntity.ok(serviceRequestService.getAll());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ServiceRequestResponse>> getPending() {
        return ResponseEntity.ok(serviceRequestService.getAllByStatus(RequestStatus.PENDING));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceRequestResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(serviceRequestService.getByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceRequestResponse> create(
            @RequestHeader("X-User-Name") String username,
            @Valid @RequestBody ServiceRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceRequestService.create(null, request));
    }

    @PostMapping("/internal/{userId}")
    public ResponseEntity<ServiceRequestResponse> createInternal(
            @PathVariable Long userId,
            @Valid @RequestBody ServiceRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceRequestService.create(userId, request));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ServiceRequestResponse> approve(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.get("adminNote") : null;
        return ResponseEntity.ok(serviceRequestService.approve(id, note));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ServiceRequestResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.get("adminNote") : null;
        return ResponseEntity.ok(serviceRequestService.reject(id, note));
    }
}
