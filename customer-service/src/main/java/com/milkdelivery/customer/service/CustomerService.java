package com.milkdelivery.customer.service;

import com.milkdelivery.customer.dto.request.CustomerRequest;
import com.milkdelivery.customer.dto.response.CustomerResponse;
import com.milkdelivery.customer.entity.Customer;
import com.milkdelivery.customer.entity.Customer.CustomerStatus;
import com.milkdelivery.customer.exception.ResourceNotFoundException;
import com.milkdelivery.customer.exception.DuplicateResourceException;
import com.milkdelivery.customer.repository.CustomerRepository;
import com.milkdelivery.customer.config.KafkaProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final KafkaProducer kafkaProducer;

    public List<CustomerResponse> getAllCustomers() {
        log.info("Fetching all customers");
        return customerRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CustomerResponse> getActiveCustomers() {
        log.info("Fetching active customers");
        return customerRepository.findByStatus(CustomerStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CustomerResponse getCustomerById(Long id) {
        log.info("Fetching customer by id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse addCustomer(CustomerRequest request) {
        log.info("Adding new customer: {}", request.getName());

        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer with phone " + request.getPhone() + " already exists");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .area(request.getArea())
                .milkQuantity(request.getMilkQuantity())
                .pricePerLitre(request.getPricePerLitre())
                .deliveryTime(request.getDeliveryTime())
                .startDate(request.getStartDate())
                .notes(request.getNotes())
                .status(request.getStatus() != null ? request.getStatus() : CustomerStatus.ACTIVE)
                .build();

        Customer saved = customerRepository.save(customer);
        kafkaProducer.sendCustomerEvent("CUSTOMER_CREATED", saved);
        return mapToResponse(saved);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        log.info("Updating customer with id: {}", id);

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        if (!customer.getPhone().equals(request.getPhone()) &&
                customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer with phone " + request.getPhone() + " already exists");
        }

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setArea(request.getArea());
        customer.setMilkQuantity(request.getMilkQuantity());
        customer.setPricePerLitre(request.getPricePerLitre());
        customer.setDeliveryTime(request.getDeliveryTime());
        customer.setStartDate(request.getStartDate());
        customer.setNotes(request.getNotes());
        if (request.getStatus() != null) {
            customer.setStatus(request.getStatus());
        }

        Customer saved = customerRepository.save(customer);
        kafkaProducer.sendCustomerEvent("CUSTOMER_UPDATED", saved);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        log.info("Deleting customer with id: {}", id);

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customerRepository.delete(customer);
        kafkaProducer.sendCustomerEvent("CUSTOMER_DELETED", customer);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .area(customer.getArea())
                .milkQuantity(customer.getMilkQuantity())
                .pricePerLitre(customer.getPricePerLitre())
                .deliveryTime(customer.getDeliveryTime())
                .startDate(customer.getStartDate())
                .notes(customer.getNotes())
                .status(customer.getStatus())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
