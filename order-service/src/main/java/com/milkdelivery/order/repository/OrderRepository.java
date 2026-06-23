package com.milkdelivery.order.repository;

import com.milkdelivery.order.entity.Order;
import com.milkdelivery.order.entity.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByDeliveryBoyId(Long deliveryBoyId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByDeliveryBoyIdAndStatus(Long deliveryBoyId, OrderStatus status);
    List<Order> findByDeliveryDate(LocalDate date);
    List<Order> findByStatusNot(OrderStatus status);
    long countByDeliveryBoyIdAndStatus(Long deliveryBoyId, OrderStatus status);
}
