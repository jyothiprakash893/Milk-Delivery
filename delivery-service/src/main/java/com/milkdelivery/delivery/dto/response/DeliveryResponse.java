package com.milkdelivery.delivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private String customerAddress;
    private String customerPhone;
    private LocalDate deliveryDate;
    private Integer quantity;
    private Boolean isDelivered;
    private String skipReason;
    private LocalDateTime markedAt;
}
