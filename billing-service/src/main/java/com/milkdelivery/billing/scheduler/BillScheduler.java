package com.milkdelivery.billing.scheduler;

import com.milkdelivery.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class BillScheduler {

    private final BillingService billingService;

    @Scheduled(cron = "0 0 0 1 * ?")
    public void generateMonthlyBills() {
        LocalDate now = LocalDate.now();
        LocalDate previousMonth = now.minusMonths(1);
        int month = previousMonth.getMonthValue();
        int year = previousMonth.getYear();

        log.info("Scheduled bill generation started for {}/{}", month, year);

        try {
            int count = billingService.generateBills(month, year);
            log.info("Scheduled bill generation completed. {} bills generated for {}/{}", count, month, year);
        } catch (Exception e) {
            log.error("Scheduled bill generation failed for {}/{}: {}", month, year, e.getMessage(), e);
        }
    }
}
