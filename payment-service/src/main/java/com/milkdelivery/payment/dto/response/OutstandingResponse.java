package com.milkdelivery.payment.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutstandingResponse {

    private Long customerId;
    private String customerName;
    private BigDecimal totalDue;
}
