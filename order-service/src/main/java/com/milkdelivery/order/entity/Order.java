package com.milkdelivery.order.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "delivery_boy_id")
    private Long deliveryBoyId;

    @Column(name = "milk_type", length = 20)
    private String milkType;

    @Column(nullable = false)
    private Double quantity;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @Column(name = "delivery_time", length = 20)
    private String deliveryTime;

    @Column(name = "delivery_address", length = 255)
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "is_paid")
    private Boolean isPaid;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = OrderStatus.PENDING;
        if (isPaid == null) isPaid = false;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum OrderStatus {
        PENDING, ASSIGNED, PICKED_UP, DELIVERED, CANCELLED
    }
}
