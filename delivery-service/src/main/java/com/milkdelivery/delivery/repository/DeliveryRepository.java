package com.milkdelivery.delivery.repository;

import com.milkdelivery.delivery.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByCustomerIdAndDeliveryDate(Long customerId, LocalDate date);

    List<Delivery> findByDeliveryDate(LocalDate date);

    List<Delivery> findByCustomerId(Long customerId);

    List<Delivery> findByDeliveryDateBetween(LocalDate start, LocalDate end);

    Long countByCustomerIdAndDeliveryDateBetweenAndIsDelivered(Long customerId, LocalDate start, LocalDate end, Boolean isDelivered);

    List<Delivery> findByCustomerIdAndDeliveryDateBetween(Long customerId, LocalDate start, LocalDate end);
}
