package com.milkdelivery.notification.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic billGeneratedTopic() {
        return TopicBuilder.name("bill-generated")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic paymentReceivedTopic() {
        return TopicBuilder.name("payment-received")
                .partitions(1)
                .replicas(1)
                .build();
    }
}
