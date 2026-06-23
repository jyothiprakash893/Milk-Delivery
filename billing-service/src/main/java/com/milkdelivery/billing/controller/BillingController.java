package com.milkdelivery.billing.controller;

import com.milkdelivery.billing.dto.response.BillResponse;
import com.milkdelivery.billing.dto.response.MessageResponse;
import com.milkdelivery.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/generate/{month}/{year}")
    public ResponseEntity<MessageResponse> generateBills(@PathVariable int month,
                                                         @PathVariable int year) {
        int count = billingService.generateBills(month, year);
        return ResponseEntity.ok(new MessageResponse(count + " bills generated for " + month + "/" + year));
    }

    @GetMapping("/all/{month}/{year}")
    public ResponseEntity<List<BillResponse>> getAllBills(@PathVariable int month,
                                                          @PathVariable int year) {
        return ResponseEntity.ok(billingService.getAllBills(month, year));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BillResponse>> getCustomerBills(@PathVariable Long customerId) {
        return ResponseEntity.ok(billingService.getCustomerBills(customerId));
    }

    @GetMapping("/unpaid")
    public ResponseEntity<List<BillResponse>> getUnpaidBills() {
        return ResponseEntity.ok(billingService.getUnpaidBills());
    }

    @GetMapping("/pdf/{billId}")
    public ResponseEntity<byte[]> generateBillPdf(@PathVariable Long billId) {
        byte[] pdfBytes = billingService.generateBillPdf(billId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "bill-" + billId + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
