package com.milkdelivery.payment.repository;

import com.milkdelivery.payment.entity.Payment;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByCustomerId(Long customerId);

    List<Payment> findByBillId(Long billId);

    List<Payment> findByCustomerIdAndPaymentDateBetween(Long customerId, LocalDate start, LocalDate end);
}
