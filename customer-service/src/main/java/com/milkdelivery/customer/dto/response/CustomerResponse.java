package com.milkdelivery.customer.dto.response;

import com.milkdelivery.customer.entity.Customer.CustomerStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String area;
    private Double milkQuantity;
    private Double pricePerLitre;
    private String deliveryTime;
    private LocalDate startDate;
    private String notes;
    private CustomerStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
