package com.milkdelivery.deliveryboy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class DeliveryBoyServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeliveryBoyServiceApplication.class, args);
    }
}
