package com.milkdelivery.product.repository;

import com.milkdelivery.product.entity.MilkProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilkProductRepository extends JpaRepository<MilkProduct, Long> {

    List<MilkProduct> findAllByActiveTrue();

    List<MilkProduct> findByNameContainingIgnoreCase(String name);
}
