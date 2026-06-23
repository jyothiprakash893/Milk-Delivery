package com.milkdelivery.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String notes;
}
