package com.milkdelivery.order.controller;

import com.milkdelivery.order.dto.request.AssignRequest;
import com.milkdelivery.order.dto.request.OrderRequest;
import com.milkdelivery.order.dto.request.StatusUpdateRequest;
import com.milkdelivery.order.dto.response.MessageResponse;
import com.milkdelivery.order.dto.response.OrderResponse;
import com.milkdelivery.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<OrderResponse>> getPendingOrders() {
        return ResponseEntity.ok(orderService.getOrdersByStatus(
                com.milkdelivery.order.entity.Order.OrderStatus.PENDING));
    }

    @GetMapping("/assigned/{deliveryBoyId}")
    public ResponseEntity<List<OrderResponse>> getAssignedOrders(@PathVariable Long deliveryBoyId) {
        return ResponseEntity.ok(orderService.getAssignedOrders(deliveryBoyId));
    }

    @GetMapping("/my/{customerId}")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getMyOrders(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<OrderResponse> assignDeliveryBoy(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest request) {
        return ResponseEntity.ok(orderService.assignDeliveryBoy(id, request.getDeliveryBoyId()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
