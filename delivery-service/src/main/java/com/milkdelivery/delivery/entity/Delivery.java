package com.milkdelivery.delivery.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"customerId", "deliveryDate"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private LocalDate deliveryDate;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Boolean isDelivered;

    private String skipReason;

    @Column(nullable = false)
    private LocalDateTime markedAt;
}
