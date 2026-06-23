package com.milkdelivery.product.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkProductResponse {

    private Long id;
    private String name;
    private String description;
    private double price;
    private int quantity;
    private String unit;
    private String imageUrl;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
