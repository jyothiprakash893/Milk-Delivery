package com.milkdelivery.delivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyReportResponse {

    private int month;
    private int year;
    private long totalDeliveries;
    private long deliveredCount;
    private long skippedCount;
    private List<DeliveryResponse> deliveries;
}
