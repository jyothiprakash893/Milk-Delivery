package com.milkdelivery.order.service;

import com.milkdelivery.order.dto.request.OrderRequest;
import com.milkdelivery.order.dto.response.OrderResponse;
import com.milkdelivery.order.entity.Order;
import com.milkdelivery.order.entity.Order.OrderStatus;
import com.milkdelivery.order.exception.ResourceNotFoundException;
import com.milkdelivery.order.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    public List<OrderResponse> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        log.info("Fetching orders by status: {}", status);
        return orderRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<OrderResponse> getMyOrders(Long customerId) {
        log.info("Fetching orders for customer: {}", customerId);
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<OrderResponse> getAssignedOrders(Long deliveryBoyId) {
        log.info("Fetching orders assigned to delivery boy: {}", deliveryBoyId);
        return orderRepository.findByDeliveryBoyId(deliveryBoyId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponse getOrderById(Long id) {
        log.info("Fetching order by id: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    @Transactional
    @CircuitBreaker(name = "productService", fallbackMethod = "createOrderFallback")
    @Retry(name = "productService")
    public OrderResponse createOrder(OrderRequest request) {
        log.info("Creating new order for customer: {}", request.getCustomerId());

        String productName = null;
        Double unitPrice = null;

        if (request.getProductId() != null) {
            try {
                ResponseEntity<Map> productResp = restTemplate.getForEntity(
                        "http://product-service/api/products/" + request.getProductId(),
                        Map.class);
                if (productResp.getBody() != null) {
                    productName = (String) productResp.getBody().get("name");
                    unitPrice = ((Number) productResp.getBody().get("price")).doubleValue();

                    restTemplate.patchForObject(
                            "http://product-service/api/products/" + request.getProductId() + "/reduce-stock",
                            Map.of("quantity", request.getQuantity().intValue()),
                            Void.class);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch/reduce product stock: {}", e.getMessage());
            }
        }

        Double total = (unitPrice != null && request.getQuantity() != null)
                ? unitPrice * request.getQuantity()
                : null;

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .productId(request.getProductId())
                .productName(productName)
                .unitPrice(unitPrice)
                .milkType(request.getMilkType())
                .quantity(request.getQuantity())
                .deliveryDate(request.getDeliveryDate())
                .deliveryTime(request.getDeliveryTime())
                .deliveryAddress(request.getDeliveryAddress())
                .specialInstructions(request.getSpecialInstructions())
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .isPaid(false)
                .build();

        Order saved = orderRepository.save(order);
        log.info("Order created with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    public OrderResponse createOrderFallback(OrderRequest request, Throwable t) {
        log.warn("Create order fallback triggered for customer {}: {}", request.getCustomerId(), t.getMessage());
        return OrderResponse.builder()
                .id(null)
                .customerId(request.getCustomerId())
                .productId(request.getProductId())
                .milkType(request.getMilkType())
                .quantity(request.getQuantity())
                .status("PENDING")
                .build();
    }

    @Transactional
    public OrderResponse assignDeliveryBoy(Long orderId, Long deliveryBoyId) {
        log.info("Assigning delivery boy {} to order {}", deliveryBoyId, orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setDeliveryBoyId(deliveryBoyId);
        order.setStatus(OrderStatus.ASSIGNED);

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, String status) {
        log.info("Updating status of order {} to {}", orderId, status);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Allowed values: PENDING, ASSIGNED, PICKED_UP, DELIVERED, CANCELLED");
        }

        if (newStatus == OrderStatus.PENDING || newStatus == OrderStatus.ASSIGNED) {
            throw new IllegalArgumentException("Cannot manually set status to " + status + ". Use assign endpoint for ASSIGNED status.");
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteOrder(Long id) {
        log.info("Deleting order with id: {}", id);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        orderRepository.delete(order);
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .deliveryBoyId(order.getDeliveryBoyId())
                .productId(order.getProductId())
                .productName(order.getProductName())
                .unitPrice(order.getUnitPrice())
                .milkType(order.getMilkType())
                .quantity(order.getQuantity())
                .deliveryDate(order.getDeliveryDate())
                .deliveryTime(order.getDeliveryTime())
                .deliveryAddress(order.getDeliveryAddress())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .specialInstructions(order.getSpecialInstructions())
                .totalAmount(order.getTotalAmount())
                .isPaid(order.getIsPaid())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
