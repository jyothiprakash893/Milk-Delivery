package com.milkdelivery.payment.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
public class PaymentResponse {

    private Long id;
    private Long billId;
    private Long customerId;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private String paymentMode;
    private String notes;
    private LocalDateTime createdAt;
}
