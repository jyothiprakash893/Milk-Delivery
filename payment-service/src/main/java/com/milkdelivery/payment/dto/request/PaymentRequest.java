package com.milkdelivery.payment.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
public class PaymentRequest {

    @NotNull(message = "billId is required")
    private Long billId;

    @NotNull(message = "amountPaid is required")
    @DecimalMin(value = "0.01", message = "amountPaid must be greater than 0")
    private BigDecimal amountPaid;

    @NotNull(message = "paymentMode is required")
    private String paymentMode;

    private String notes;
}
