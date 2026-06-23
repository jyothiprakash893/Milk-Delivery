package com.milkdelivery.billing.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic billGeneratedTopic() {
        return TopicBuilder.name("bill-generated")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic deliveryMarkedTopic() {
        return TopicBuilder.name("delivery-marked")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
