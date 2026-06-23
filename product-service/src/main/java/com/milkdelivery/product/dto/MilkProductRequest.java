package com.milkdelivery.product.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkProductRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Positive(message = "Price must be positive")
    private double price;

    @Min(value = 0, message = "Quantity must not be negative")
    private int quantity;

    @Size(max = 50, message = "Unit must not exceed 50 characters")
    private String unit;

    @Size(max = 255, message = "Image URL must not exceed 255 characters")
    private String imageUrl;
}
