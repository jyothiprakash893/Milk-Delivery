package com.milkdelivery.product.controller;

import com.milkdelivery.product.dto.MilkProductRequest;
import com.milkdelivery.product.dto.MilkProductResponse;
import com.milkdelivery.product.service.MilkProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class MilkProductController {

    private final MilkProductService milkProductService;

    @GetMapping
    public ResponseEntity<List<MilkProductResponse>> getAllProducts() {
        return ResponseEntity.ok(milkProductService.getAllProducts());
    }

    @GetMapping("/active")
    public ResponseEntity<List<MilkProductResponse>> getActiveProducts() {
        return ResponseEntity.ok(milkProductService.getActiveProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MilkProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(milkProductService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<MilkProductResponse> createProduct(@Valid @RequestBody MilkProductRequest request) {
        MilkProductResponse response = milkProductService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MilkProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody MilkProductRequest request) {
        return ResponseEntity.ok(milkProductService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        milkProductService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<MilkProductResponse> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        int quantity = body.get("quantity");
        return ResponseEntity.ok(milkProductService.updateStock(id, quantity));
    }

    @PatchMapping("/{id}/reduce-stock")
    public ResponseEntity<MilkProductResponse> reduceStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        int quantity = body.get("quantity");
        return ResponseEntity.ok(milkProductService.reduceStock(id, quantity));
    }
}
