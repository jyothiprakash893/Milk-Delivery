package com.milkdelivery.customer.dto.response;

import com.milkdelivery.customer.entity.ServiceRequest.RequestStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestResponse {
    private Long id;
    private Long userId;
    private Long customerId;
    private String name;
    private String phone;
    private String address;
    private String area;
    private RequestStatus status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
