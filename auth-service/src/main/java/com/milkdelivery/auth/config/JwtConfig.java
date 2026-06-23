package com.milkdelivery.auth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtConfig {

    private String accessSecret;
    private String refreshSecret;
    private long accessExpiration;
    private long refreshExpiration;
}
