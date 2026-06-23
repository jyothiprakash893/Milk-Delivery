package com.milkdelivery.billing.repository;

import com.milkdelivery.billing.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    Optional<Bill> findByCustomerIdAndMonthAndYear(Long customerId, int month, int year);

    List<Bill> findByMonthAndYear(int month, int year);

    List<Bill> findByCustomerId(Long customerId);

    List<Bill> findByIsPaidFalse();

    List<Bill> findByCustomerIdAndIsPaidFalse(Long customerId);
}
