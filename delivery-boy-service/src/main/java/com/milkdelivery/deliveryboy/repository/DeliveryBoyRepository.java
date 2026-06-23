package com.milkdelivery.deliveryboy.repository;

import com.milkdelivery.deliveryboy.entity.DeliveryBoy;
import com.milkdelivery.deliveryboy.entity.DeliveryBoy.BoyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryBoyRepository extends JpaRepository<DeliveryBoy, Long> {
    Optional<DeliveryBoy> findByPhone(String phone);
    List<DeliveryBoy> findByStatus(BoyStatus status);
    List<DeliveryBoy> findByIsAvailableTrue();
    List<DeliveryBoy> findByArea(String area);
    boolean existsByPhone(String phone);
}
