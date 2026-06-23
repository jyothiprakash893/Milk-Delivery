package com.milkdelivery.deliveryboy.dto.response;

import com.milkdelivery.deliveryboy.entity.DeliveryBoy.BoyStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryBoyResponse {

    private Long id;
    private Long userId;
    private String name;
    private String phone;
    private String email;
    private String vehicleNumber;
    private String area;
    private Boolean isAvailable;
    private BoyStatus status;
    private Double rating;
    private Integer totalDeliveries;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
