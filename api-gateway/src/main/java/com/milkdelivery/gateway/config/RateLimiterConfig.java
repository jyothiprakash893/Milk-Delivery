package com.milkdelivery.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String username = exchange.getRequest().getHeaders().getFirst("X-User-Name");
            if (username != null) {
                return Mono.just(username);
            }
            String ip = exchange.getRequest().getRemoteAddress() != null
                    ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                    : "unknown";
            return Mono.just(ip);
        };
    }

    @Bean
    @Primary
    public RedisRateLimiter defaultRateLimiter() {
        return new RedisRateLimiter(20, 40, 1);
    }

    @Bean
    public RedisRateLimiter strictRateLimiter() {
        return new RedisRateLimiter(5, 10, 1);
    }
}
