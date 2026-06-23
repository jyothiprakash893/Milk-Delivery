package com.milkdelivery.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class GatewayConfig {

    private final RedisRateLimiter defaultRateLimiter;
    private final RedisRateLimiter strictRateLimiter;
    private final KeyResolver userKeyResolver;

    public GatewayConfig(RedisRateLimiter defaultRateLimiter, RedisRateLimiter strictRateLimiter,
                         KeyResolver userKeyResolver) {
        this.defaultRateLimiter = defaultRateLimiter;
        this.strictRateLimiter = strictRateLimiter;
        this.userKeyResolver = userKeyResolver;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r.path("/api/auth/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(strictRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://auth-service"))
                .route("oauth2", r -> r.path("/oauth2/**", "/login/oauth2/**")
                        .uri("lb://auth-service"))
                .route("customer-service", r -> r.path("/api/customers/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(defaultRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://customer-service"))
                .route("delivery-service", r -> r.path("/api/deliveries/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(defaultRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://delivery-service"))
                .route("billing-service", r -> r.path("/api/billing/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(defaultRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://billing-service"))
                .route("payment-service", r -> r.path("/api/payments/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(defaultRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://payment-service"))
                .route("notification-service", r -> r.path("/api/notifications/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(defaultRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://notification-service"))
                .route("order-service", r -> r.path("/api/orders/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(defaultRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://order-service"))
                .route("delivery-boy-service", r -> r.path("/api/delivery-boys/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(defaultRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://delivery-boy-service"))
                .route("service-requests", r -> r.path("/api/service-requests/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(defaultRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://customer-service"))
                .route("product-service", r -> r.path("/api/products/**")
                        .filters(f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(defaultRateLimiter)
                                .setKeyResolver(userKeyResolver)))
                        .uri("lb://product-service"))
                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}
