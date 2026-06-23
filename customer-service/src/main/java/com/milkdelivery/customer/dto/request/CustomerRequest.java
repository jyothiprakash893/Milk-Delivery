package com.milkdelivery.customer.dto.request;

import com.milkdelivery.customer.entity.Customer.CustomerStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerRequest {

    private Long userId;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phone;

    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 100, message = "Area must not exceed 100 characters")
    private String area;

    @Positive(message = "Milk quantity must be positive")
    private Double milkQuantity;

    @Positive(message = "Price per litre must be positive")
    private Double pricePerLitre;

    private String deliveryTime;

    private LocalDate startDate;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    private CustomerStatus status;
}
