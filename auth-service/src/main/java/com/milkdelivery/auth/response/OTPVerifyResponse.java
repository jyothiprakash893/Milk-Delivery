package com.milkdelivery.auth.dto.response;

import lombok.Data;

@Data
public class OTPVerifyResponse {
    private boolean success;
    private String message;
}