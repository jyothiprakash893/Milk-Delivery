package com.milkdelivery.billing.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponse {
    private Long id;
    private Long customerId;
    private int month;
    private int year;
    private int totalDaysDelivered;
    private double totalLitres;
    private double pricePerLitre;
    private double totalAmount;
    private boolean isPaid;
    private LocalDateTime generatedAt;
}
