package com.milkdelivery.notification.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "sendgrid")
public class SendGridConfig {

    private static final Logger log = LoggerFactory.getLogger(SendGridConfig.class);

    private String apiKey;
    private String fromEmail;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getFromEmail() {
        return fromEmail;
    }

    public void setFromEmail(String fromEmail) {
        this.fromEmail = fromEmail;
    }

    @PostConstruct
    public void init() {
        if (apiKey != null && fromEmail != null) {
            log.info("SendGrid configured with From Email: {}", fromEmail);
        } else {
            log.warn("SendGrid not fully configured - using stub implementation");
        }
    }
}
