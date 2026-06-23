package com.milkdelivery.customer.service;

import com.milkdelivery.customer.dto.request.ServiceRequestRequest;
import com.milkdelivery.customer.dto.response.ServiceRequestResponse;
import com.milkdelivery.customer.entity.Customer;
import com.milkdelivery.customer.entity.Customer.CustomerStatus;
import com.milkdelivery.customer.entity.ServiceRequest;
import com.milkdelivery.customer.entity.ServiceRequest.RequestStatus;
import com.milkdelivery.customer.exception.ResourceNotFoundException;
import com.milkdelivery.customer.repository.CustomerRepository;
import com.milkdelivery.customer.repository.ServiceRequestRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final CustomerRepository customerRepository;
    private final RestTemplate restTemplate;

    public List<ServiceRequestResponse> getAll() {
        return serviceRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ServiceRequestResponse> getAllByStatus(RequestStatus status) {
        return serviceRequestRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ServiceRequestResponse> getByUserId(Long userId) {
        return serviceRequestRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ServiceRequestResponse getById(Long id) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + id));
        return mapToResponse(sr);
    }

    @Transactional
    public ServiceRequestResponse create(Long userId, ServiceRequestRequest request) {
        ServiceRequest sr = ServiceRequest.builder()
                .userId(userId)
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .area(request.getArea())
                .status(RequestStatus.PENDING)
                .build();
        sr = serviceRequestRepository.save(sr);
        log.info("Service request created for user {}", userId);
        return mapToResponse(sr);
    }

    @Transactional
    public ServiceRequestResponse approve(Long requestId, String adminNote) {
        ServiceRequest sr = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + requestId));

        Customer customer = Customer.builder()
                .userId(sr.getUserId())
                .name(sr.getName())
                .phone(sr.getPhone())
                .address(sr.getAddress())
                .area(sr.getArea())
                .status(CustomerStatus.ACTIVE)
                .build();
        customer = customerRepository.save(customer);

        sr.setCustomerId(customer.getId());
        sr.setStatus(RequestStatus.APPROVED);
        sr.setAdminNote(adminNote);
        sr = serviceRequestRepository.save(sr);

        try {
            activateUserInAuthService(sr.getUserId(), customer.getId());
        } catch (Exception e) {
            log.warn("Could not notify auth-service to activate user: {}", e.getMessage());
        }

        log.info("Service request {} approved, customer {} created", requestId, customer.getId());
        return mapToResponse(sr);
    }

    @Transactional
    public ServiceRequestResponse reject(Long requestId, String adminNote) {
        ServiceRequest sr = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + requestId));

        sr.setStatus(RequestStatus.REJECTED);
        sr.setAdminNote(adminNote);
        sr = serviceRequestRepository.save(sr);
        log.info("Service request {} rejected", requestId);
        return mapToResponse(sr);
    }

    @CircuitBreaker(name = "authService", fallbackMethod = "activateUserFallback")
    @Retry(name = "authService")
    public void activateUserInAuthService(Long userId, Long customerId) {
        restTemplate.put(
                "http://auth-service/api/auth/users/" + userId + "/activate",
                Map.of("customerId", customerId)
        );
    }

    public void activateUserFallback(Long userId, Long customerId, Throwable t) {
        log.warn("Failed to activate user {} in auth-service after retries: {}", userId, t.getMessage());
    }

    private ServiceRequestResponse mapToResponse(ServiceRequest sr) {
        return ServiceRequestResponse.builder()
                .id(sr.getId())
                .userId(sr.getUserId())
                .customerId(sr.getCustomerId())
                .name(sr.getName())
                .phone(sr.getPhone())
                .address(sr.getAddress())
                .area(sr.getArea())
                .status(sr.getStatus())
                .adminNote(sr.getAdminNote())
                .createdAt(sr.getCreatedAt())
                .updatedAt(sr.getUpdatedAt())
                .build();
    }
}
