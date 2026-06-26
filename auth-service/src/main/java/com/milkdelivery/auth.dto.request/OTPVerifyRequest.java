package com.milkdelivery.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OTPVerifyRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String type;
    @NotBlank
    private String code;
}