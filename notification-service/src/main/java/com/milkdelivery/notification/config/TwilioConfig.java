package com.milkdelivery.notification.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "twilio")
public class TwilioConfig {

    private static final Logger log = LoggerFactory.getLogger(TwilioConfig.class);

    private String accountSid;
    private String authToken;
    private String fromNumber;

    public String getAccountSid() {
        return accountSid;
    }

    public void setAccountSid(String accountSid) {
        this.accountSid = accountSid;
    }

    public String getAuthToken() {
        return authToken;
    }

    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }

    public String getFromNumber() {
        return fromNumber;
    }

    public void setFromNumber(String fromNumber) {
        this.fromNumber = fromNumber;
    }

    @PostConstruct
    public void init() {
        if (accountSid != null && authToken != null) {
            log.info("Twilio configured with Account SID: {}", accountSid);
        } else {
            log.warn("Twilio not fully configured - using stub implementation");
        }
    }
}
