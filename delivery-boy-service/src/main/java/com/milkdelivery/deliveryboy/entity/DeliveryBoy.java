package com.milkdelivery.deliveryboy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_boys")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeliveryBoy {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "vehicle_number", length = 50)
    private String vehicleNumber;

    @Column(length = 100)
    private String area;

    @Column(name = "is_available")
    private Boolean isAvailable;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BoyStatus status;

    private Double rating;

    @Column(name = "total_deliveries")
    private Integer totalDeliveries;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = BoyStatus.ACTIVE;
        if (isAvailable == null) isAvailable = true;
        if (totalDeliveries == null) totalDeliveries = 0;
        if (rating == null) rating = 0.0;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum BoyStatus { ACTIVE, INACTIVE, SUSPENDED }
}
