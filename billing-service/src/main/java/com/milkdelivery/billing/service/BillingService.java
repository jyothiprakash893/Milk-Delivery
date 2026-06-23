package com.milkdelivery.billing.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.milkdelivery.billing.dto.response.BillResponse;
import com.milkdelivery.billing.entity.Bill;
import com.milkdelivery.billing.kafka.BillingEventProducer;
import com.milkdelivery.billing.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final BillRepository billRepository;
    private final BillingEventProducer eventProducer;
    private final RestTemplate restTemplate;

    @Value("${delivery.service.url}")
    private String deliveryServiceUrl;

    @Value("${customer.service.url}")
    private String customerServiceUrl;

    @Transactional
    public int generateBills(int month, int year) {
        List<Map<String, Object>> customers = fetchAllCustomers();
        int count = 0;

        for (Map<String, Object> customer : customers) {
            Long customerId = Long.valueOf(customer.get("id").toString());

            Optional<Bill> existing = billRepository.findByCustomerIdAndMonthAndYear(customerId, month, year);
            if (existing.isPresent()) {
                log.info("Bill already exists for customer {} for {}/{}", customerId, month, year);
                continue;
            }

            List<Map<String, Object>> deliveries = fetchDeliveriesForMonth(customerId, month, year);
            List<Map<String, Object>> delivered = deliveries.stream()
                    .filter(d -> Boolean.TRUE.equals(d.get("isDelivered")))
                    .toList();

            if (delivered.isEmpty()) {
                log.info("No deliveries found for customer {} in {}/{}", customerId, month, year);
                continue;
            }

            int totalDaysDelivered = delivered.size();
            double totalLitres = delivered.stream()
                    .mapToDouble(d -> Double.parseDouble(d.get("litres").toString()))
                    .sum();
            double pricePerLitre = getPricePerLitre(customer);

            Bill bill = Bill.builder()
                    .customerId(customerId)
                    .month(month)
                    .year(year)
                    .totalDaysDelivered(totalDaysDelivered)
                    .totalLitres(totalLitres)
                    .pricePerLitre(pricePerLitre)
                    .totalAmount(Math.round(totalLitres * pricePerLitre * 100.0) / 100.0)
                    .isPaid(false)
                    .build();

            bill = billRepository.save(bill);
            count++;

            BillResponse response = toResponse(bill);
            eventProducer.publishBillGenerated(response);
            log.info("Generated bill {} for customer {}", bill.getId(), customerId);
        }

        log.info("Generated {} bills for {}/{}", count, month, year);
        return count;
    }

    public List<BillResponse> getAllBills(int month, int year) {
        return billRepository.findByMonthAndYear(month, year)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BillResponse> getCustomerBills(Long customerId) {
        return billRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BillResponse> getUnpaidBills() {
        return billRepository.findByIsPaidFalse()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public byte[] generateBillPdf(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found with id: " + billId));

        Map<String, Object> customer = fetchCustomer(bill.getCustomerId());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(0, 51, 102));
            Font headerFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(51, 51, 51));
            Font normalFont = new Font(Font.HELVETICA, 12, Font.NORMAL, new Color(51, 51, 51));
            Font boldFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(51, 51, 51));

            Paragraph title = new Paragraph("Milk Delivery - Invoice", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            Paragraph billInfo = new Paragraph();
            billInfo.add(new Chunk("Bill #: ", boldFont));
            billInfo.add(new Chunk(String.valueOf(bill.getId()), normalFont));
            billInfo.add(Chunk.NEWLINE);
            billInfo.add(new Chunk("Month: ", boldFont));
            billInfo.add(new Chunk(bill.getMonth() + "/" + bill.getYear(), normalFont));
            billInfo.add(Chunk.NEWLINE);
            billInfo.add(new Chunk("Generated: ", boldFont));
            billInfo.add(new Chunk(bill.getGeneratedAt().toString(), normalFont));
            billInfo.add(Chunk.NEWLINE);
            billInfo.add(Chunk.NEWLINE);
            document.add(billInfo);

            Paragraph customerTitle = new Paragraph("Customer Details", headerFont);
            customerTitle.setSpacingAfter(10);
            document.add(customerTitle);

            PdfPTable customerTable = new PdfPTable(2);
            customerTable.setWidthPercentage(100);
            customerTable.setSpacingAfter(20);

            addCell(customerTable, "Customer ID:", boldFont);
            addCell(customerTable, String.valueOf(customer.get("id")), normalFont);
            addCell(customerTable, "Name:", boldFont);
            addCell(customerTable, String.valueOf(customer.getOrDefault("name", "")), normalFont);
            addCell(customerTable, "Address:", boldFont);
            addCell(customerTable, String.valueOf(customer.getOrDefault("address", "")), normalFont);
            addCell(customerTable, "Phone:", boldFont);
            addCell(customerTable, String.valueOf(customer.getOrDefault("phone", "")), normalFont);

            document.add(customerTable);

            Paragraph detailsTitle = new Paragraph("Bill Breakdown", headerFont);
            detailsTitle.setSpacingAfter(10);
            document.add(detailsTitle);

            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setSpacingAfter(20);

            addCell(detailsTable, "Total Days Delivered:", boldFont);
            addCell(detailsTable, String.valueOf(bill.getTotalDaysDelivered()), normalFont);
            addCell(detailsTable, "Total Litres:", boldFont);
            addCell(detailsTable, String.format("%.2f L", bill.getTotalLitres()), normalFont);
            addCell(detailsTable, "Price per Litre:", boldFont);
            addCell(detailsTable, String.format("$%.2f", bill.getPricePerLitre()), normalFont);

            document.add(detailsTable);

            Paragraph totalParagraph = new Paragraph();
            totalParagraph.add(new Chunk("Total Amount: ", new Font(Font.HELVETICA, 16, Font.BOLD, new Color(0, 102, 51))));
            totalParagraph.add(new Chunk(String.format("$%.2f", bill.getTotalAmount()), new Font(Font.HELVETICA, 16, Font.BOLD, new Color(0, 102, 51))));
            totalParagraph.setAlignment(Element.ALIGN_RIGHT);
            totalParagraph.setSpacingAfter(30);
            document.add(totalParagraph);

            Paragraph status = new Paragraph();
            status.add(new Chunk("Payment Status: ", boldFont));
            status.add(new Chunk(bill.isPaid() ? "PAID" : "UNPAID",
                    new Font(Font.HELVETICA, 14, Font.BOLD, bill.isPaid() ? new Color(0, 153, 0) : new Color(204, 0, 0))));
            status.setAlignment(Element.ALIGN_CENTER);
            document.add(status);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }

        return baos.toByteArray();
    }

    private BillResponse toResponse(Bill bill) {
        return BillResponse.builder()
                .id(bill.getId())
                .customerId(bill.getCustomerId())
                .month(bill.getMonth())
                .year(bill.getYear())
                .totalDaysDelivered(bill.getTotalDaysDelivered())
                .totalLitres(bill.getTotalLitres())
                .pricePerLitre(bill.getPricePerLitre())
                .totalAmount(bill.getTotalAmount())
                .isPaid(bill.isPaid())
                .generatedAt(bill.getGeneratedAt())
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchAllCustomers() {
        try {
            String url = customerServiceUrl;
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            return response.getBody() != null ? response.getBody() : List.of();
        } catch (Exception e) {
            log.error("Failed to fetch customers from customer service: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchCustomer(Long customerId) {
        try {
            String url = customerServiceUrl + "/" + customerId;
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.error("Failed to fetch customer {}: {}", customerId, e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("id", customerId);
            fallback.put("name", "Unknown");
            fallback.put("address", "N/A");
            fallback.put("phone", "N/A");
            return fallback;
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchDeliveriesForMonth(Long customerId, int month, int year) {
        try {
            String url = deliveryServiceUrl + "/customer/" + customerId + "/month/" + month + "/year/" + year;
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            return response.getBody() != null ? response.getBody() : List.of();
        } catch (Exception e) {
            log.error("Failed to fetch deliveries for customer {} in {}/{}: {}", customerId, month, year, e.getMessage());
            return List.of();
        }
    }

    private double getPricePerLitre(Map<String, Object> customer) {
        Object price = customer.get("pricePerLitre");
        if (price != null) {
            return Double.parseDouble(price.toString());
        }
        return 1.50;
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPadding(5);
        table.addCell(cell);
    }
}
