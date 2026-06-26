package com.milkdelivery.auth.controller;

import com.milkdelivery.auth.dto.request.OTPSendRequest;
import com.milkdelivery.auth.dto.request.OTPVerifyRequest;
import com.milkdelivery.auth.dto.response.OTPVerifyResponse;
import com.milkdelivery.auth.service.OTPService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/otp")
public class OTPController {

    private final OTPService otpService;

    @PostMapping("/send")
    public ResponseEntity<String> sendOTP(@Valid @RequestBody OTPSendRequest request) {
        return ResponseEntity.ok(otpService.sendOTP(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<OTPVerifyResponse> verifyOTP(@Valid @RequestBody OTPVerifyRequest request) {
        boolean success = otpService.verifyOTP(request);
        OTPVerifyResponse response = new OTPVerifyResponse();
        response.setSuccess(success);
        response.setMessage(success ? "OTP verified successfully" : "Invalid or expired OTP");
        return ResponseEntity.ok(response);
    }
}