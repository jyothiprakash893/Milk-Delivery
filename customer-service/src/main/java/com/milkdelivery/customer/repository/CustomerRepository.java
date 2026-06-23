package com.milkdelivery.customer.repository;

import com.milkdelivery.customer.entity.Customer;
import com.milkdelivery.customer.entity.Customer.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    List<Customer> findByStatus(CustomerStatus status);

    List<Customer> findByArea(String area);

    List<Customer> findByStatusNot(CustomerStatus status);

    boolean existsByPhone(String phone);
}
