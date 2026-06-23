package com.milkdelivery.billing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bills",
       uniqueConstraints = @UniqueConstraint(columnNames = {"customerId", "month", "year"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int totalDaysDelivered;

    @Column(nullable = false)
    private double totalLitres;

    @Column(nullable = false)
    private double pricePerLitre;

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private boolean isPaid;

    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        this.generatedAt = LocalDateTime.now();
    }
}
