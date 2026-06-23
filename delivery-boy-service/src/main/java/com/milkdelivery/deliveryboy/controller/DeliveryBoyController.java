package com.milkdelivery.deliveryboy.controller;

import com.milkdelivery.deliveryboy.dto.request.DeliveryBoyRequest;
import com.milkdelivery.deliveryboy.dto.response.DeliveryBoyResponse;
import com.milkdelivery.deliveryboy.dto.response.MessageResponse;
import com.milkdelivery.deliveryboy.entity.DeliveryBoy.BoyStatus;
import com.milkdelivery.deliveryboy.service.DeliveryBoyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-boys")
@RequiredArgsConstructor
public class DeliveryBoyController {

    private final DeliveryBoyService deliveryBoyService;

    @GetMapping
    public ResponseEntity<List<DeliveryBoyResponse>> getAllDeliveryBoys() {
        return ResponseEntity.ok(deliveryBoyService.getAllDeliveryBoys());
    }

    @GetMapping("/available")
    public ResponseEntity<List<DeliveryBoyResponse>> getAvailableDeliveryBoys() {
        return ResponseEntity.ok(deliveryBoyService.getAvailableDeliveryBoys());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryBoyResponse> getDeliveryBoyById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryBoyService.getDeliveryBoyById(id));
    }

    @PostMapping
    public ResponseEntity<DeliveryBoyResponse> registerDeliveryBoy(@Valid @RequestBody DeliveryBoyRequest request) {
        DeliveryBoyResponse response = deliveryBoyService.registerDeliveryBoy(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryBoyResponse> updateDeliveryBoy(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryBoyRequest request) {
        return ResponseEntity.ok(deliveryBoyService.updateDeliveryBoy(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DeliveryBoyResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        BoyStatus status = BoyStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(deliveryBoyService.updateStatus(id, status));
    }

    @PutMapping("/{id}/toggle-availability")
    public ResponseEntity<DeliveryBoyResponse> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryBoyService.toggleAvailability(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteDeliveryBoy(@PathVariable Long id) {
        deliveryBoyService.deleteDeliveryBoy(id);
        return ResponseEntity.ok(new MessageResponse("Delivery boy deleted successfully"));
    }
}
