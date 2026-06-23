package com.milkdelivery.order.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderResponse {

    private Long id;
    private Long customerId;
    private Long deliveryBoyId;
    private Long productId;
    private String productName;
    private Double unitPrice;
    private String milkType;
    private Double quantity;
    private LocalDate deliveryDate;
    private String deliveryTime;
    private String deliveryAddress;
    private String status;
    private String specialInstructions;
    private Double totalAmount;
    private Boolean isPaid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
