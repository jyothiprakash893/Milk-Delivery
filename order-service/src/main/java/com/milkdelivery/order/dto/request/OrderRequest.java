package com.milkdelivery.order.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @Size(max = 20, message = "Milk type must not exceed 20 characters")
    private String milkType;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;

    @Size(max = 20, message = "Delivery time must not exceed 20 characters")
    private String deliveryTime;

    @Size(max = 255, message = "Delivery address must not exceed 255 characters")
    private String deliveryAddress;

    @Size(max = 500, message = "Special instructions must not exceed 500 characters")
    private String specialInstructions;
}
