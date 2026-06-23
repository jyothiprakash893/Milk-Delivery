package com.milkdelivery.deliveryboy.service;

import com.milkdelivery.deliveryboy.dto.request.DeliveryBoyRequest;
import com.milkdelivery.deliveryboy.dto.response.DeliveryBoyResponse;
import com.milkdelivery.deliveryboy.entity.DeliveryBoy;
import com.milkdelivery.deliveryboy.entity.DeliveryBoy.BoyStatus;
import com.milkdelivery.deliveryboy.exception.ResourceNotFoundException;
import com.milkdelivery.deliveryboy.exception.DuplicateResourceException;
import com.milkdelivery.deliveryboy.repository.DeliveryBoyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryBoyService {

    private final DeliveryBoyRepository deliveryBoyRepository;

    public List<DeliveryBoyResponse> getAllDeliveryBoys() {
        log.info("Fetching all delivery boys");
        return deliveryBoyRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<DeliveryBoyResponse> getAvailableDeliveryBoys() {
        log.info("Fetching available delivery boys");
        return deliveryBoyRepository.findByIsAvailableTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DeliveryBoyResponse getDeliveryBoyById(Long id) {
        log.info("Fetching delivery boy by id: {}", id);
        DeliveryBoy deliveryBoy = deliveryBoyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery boy not found with id: " + id));
        return mapToResponse(deliveryBoy);
    }

    @Transactional
    public DeliveryBoyResponse registerDeliveryBoy(DeliveryBoyRequest request) {
        log.info("Registering new delivery boy: {}", request.getName());

        if (deliveryBoyRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Delivery boy with phone " + request.getPhone() + " already exists");
        }

        DeliveryBoy deliveryBoy = DeliveryBoy.builder()
                .userId(request.getUserId())
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .vehicleNumber(request.getVehicleNumber())
                .area(request.getArea())
                .build();

        DeliveryBoy saved = deliveryBoyRepository.save(deliveryBoy);
        return mapToResponse(saved);
    }

    @Transactional
    public DeliveryBoyResponse updateDeliveryBoy(Long id, DeliveryBoyRequest request) {
        log.info("Updating delivery boy with id: {}", id);

        DeliveryBoy deliveryBoy = deliveryBoyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery boy not found with id: " + id));

        if (!deliveryBoy.getPhone().equals(request.getPhone()) &&
                deliveryBoyRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Delivery boy with phone " + request.getPhone() + " already exists");
        }

        deliveryBoy.setUserId(request.getUserId());
        deliveryBoy.setName(request.getName());
        deliveryBoy.setPhone(request.getPhone());
        deliveryBoy.setEmail(request.getEmail());
        deliveryBoy.setVehicleNumber(request.getVehicleNumber());
        deliveryBoy.setArea(request.getArea());

        DeliveryBoy saved = deliveryBoyRepository.save(deliveryBoy);
        return mapToResponse(saved);
    }

    @Transactional
    public DeliveryBoyResponse updateStatus(Long id, BoyStatus status) {
        log.info("Updating status for delivery boy with id: {} to {}", id, status);

        DeliveryBoy deliveryBoy = deliveryBoyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery boy not found with id: " + id));

        deliveryBoy.setStatus(status);
        DeliveryBoy saved = deliveryBoyRepository.save(deliveryBoy);
        return mapToResponse(saved);
    }

    @Transactional
    public DeliveryBoyResponse toggleAvailability(Long id) {
        log.info("Toggling availability for delivery boy with id: {}", id);

        DeliveryBoy deliveryBoy = deliveryBoyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery boy not found with id: " + id));

        deliveryBoy.setIsAvailable(!Boolean.TRUE.equals(deliveryBoy.getIsAvailable()));
        DeliveryBoy saved = deliveryBoyRepository.save(deliveryBoy);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteDeliveryBoy(Long id) {
        log.info("Deleting delivery boy with id: {}", id);

        DeliveryBoy deliveryBoy = deliveryBoyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery boy not found with id: " + id));

        deliveryBoyRepository.delete(deliveryBoy);
    }

    @Transactional
    public DeliveryBoyResponse incrementDeliveries(Long id) {
        log.info("Incrementing deliveries for delivery boy with id: {}", id);

        DeliveryBoy deliveryBoy = deliveryBoyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery boy not found with id: " + id));

        deliveryBoy.setTotalDeliveries(deliveryBoy.getTotalDeliveries() + 1);
        DeliveryBoy saved = deliveryBoyRepository.save(deliveryBoy);
        return mapToResponse(saved);
    }

    private DeliveryBoyResponse mapToResponse(DeliveryBoy deliveryBoy) {
        return DeliveryBoyResponse.builder()
                .id(deliveryBoy.getId())
                .userId(deliveryBoy.getUserId())
                .name(deliveryBoy.getName())
                .phone(deliveryBoy.getPhone())
                .email(deliveryBoy.getEmail())
                .vehicleNumber(deliveryBoy.getVehicleNumber())
                .area(deliveryBoy.getArea())
                .isAvailable(deliveryBoy.getIsAvailable())
                .status(deliveryBoy.getStatus())
                .rating(deliveryBoy.getRating())
                .totalDeliveries(deliveryBoy.getTotalDeliveries())
                .createdAt(deliveryBoy.getCreatedAt())
                .updatedAt(deliveryBoy.getUpdatedAt())
                .build();
    }
}
