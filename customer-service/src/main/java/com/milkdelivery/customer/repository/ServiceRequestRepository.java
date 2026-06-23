package com.milkdelivery.customer.repository;

import com.milkdelivery.customer.entity.ServiceRequest;
import com.milkdelivery.customer.entity.ServiceRequest.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByStatus(RequestStatus status);
    List<ServiceRequest> findByUserId(Long userId);
    Optional<ServiceRequest> findByUserIdAndStatus(Long userId, RequestStatus status);
}
