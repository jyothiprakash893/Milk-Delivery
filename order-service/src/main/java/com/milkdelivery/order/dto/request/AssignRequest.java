package com.milkdelivery.order.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssignRequest {

    @NotNull(message = "Delivery boy ID is required")
    private Long deliveryBoyId;
}
