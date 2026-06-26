package com.milkdelivery.auth.service;

import com.milkdelivery.auth.dto.request.OTPSendRequest;
import com.milkdelivery.auth.dto.request.OTPVerifyRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OTPService {

    private final StringRedisTemplate redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String OTP_PREFIX = "otp:";

    public String sendOTP(OTPSendRequest request) {
        String username = request.getUsername();
        String type = request.getType();
        String key = OTP_PREFIX + username + ":" + type;

        // Generate 6-digit random code
        int code = ThreadLocalRandom.current().nextInt(100000, 1000000);
        String codeStr = String.format("%06d", code);

        // Store in Redis with 5 minute expiration
        redisTemplate.opsForValue().set(key, codeStr, 5 * 60); // 5 minutes in seconds

        // Publish Kafka event based on type
        if ("email".equalsIgnoreCase(type)) {
            kafkaTemplate.send("otp-send-email", username, codeStr);
        } else if ("phone".equalsIgnoreCase(type)) {
            kafkaTemplate.send("otp-send-sms", username, codeStr);
        } else {
            throw new IllegalArgumentException("Invalid OTP type: " + type);
        }

        return codeStr;
    }

    public boolean verifyOTP(OTPVerifyRequest request) {
        String username = request.getUsername();
        String type = request.getType();
        String code = request.getCode();

        String key = OTP_PREFIX + username + ":" + type;
        String storedCode = redisTemplate.opsForValue().get(key);
        if (storedCode == null) {
            return false;
        }
        boolean isValid = storedCode.equals(code);
        if (isValid) {
            // Mark as verified by deleting the key
            redisTemplate.delete(key);
        }
        return isValid;
    }
}