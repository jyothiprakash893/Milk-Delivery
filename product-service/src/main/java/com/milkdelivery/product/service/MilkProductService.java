package com.milkdelivery.product.service;

import com.milkdelivery.product.dto.MilkProductRequest;
import com.milkdelivery.product.dto.MilkProductResponse;
import com.milkdelivery.product.entity.MilkProduct;
import com.milkdelivery.product.exception.InsufficientStockException;
import com.milkdelivery.product.exception.ResourceNotFoundException;
import com.milkdelivery.product.repository.MilkProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MilkProductService {

    private final MilkProductRepository milkProductRepository;

    public List<MilkProductResponse> getAllProducts() {
        log.info("Fetching all products");
        return milkProductRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<MilkProductResponse> getActiveProducts() {
        log.info("Fetching active products");
        return milkProductRepository.findAllByActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public MilkProductResponse getProductById(Long id) {
        log.info("Fetching product by id: {}", id);
        MilkProduct product = milkProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Transactional
    public MilkProductResponse createProduct(MilkProductRequest request) {
        log.info("Creating product: {}", request.getName());

        MilkProduct product = MilkProduct.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .imageUrl(request.getImageUrl())
                .active(true)
                .build();

        MilkProduct saved = milkProductRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public MilkProductResponse updateProduct(Long id, MilkProductRequest request) {
        log.info("Updating product with id: {}", id);

        MilkProduct product = milkProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setUnit(request.getUnit());
        product.setImageUrl(request.getImageUrl());

        MilkProduct saved = milkProductRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("Soft deleting product with id: {}", id);

        MilkProduct product = milkProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setActive(false);
        milkProductRepository.save(product);
    }

    @Transactional
    public MilkProductResponse updateStock(Long id, int quantity) {
        log.info("Updating stock for product id: {} to quantity: {}", id, quantity);

        MilkProduct product = milkProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setQuantity(quantity);
        MilkProduct saved = milkProductRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public MilkProductResponse reduceStock(Long id, int quantity) {
        log.info("Reducing stock for product id: {} by quantity: {}", id, quantity);

        MilkProduct product = milkProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.getQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock for product id: " + id
                    + ". Available: " + product.getQuantity() + ", Requested: " + quantity);
        }

        product.setQuantity(product.getQuantity() - quantity);
        MilkProduct saved = milkProductRepository.save(product);
        return mapToResponse(saved);
    }

    private MilkProductResponse mapToResponse(MilkProduct product) {
        return MilkProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .unit(product.getUnit())
                .imageUrl(product.getImageUrl())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
