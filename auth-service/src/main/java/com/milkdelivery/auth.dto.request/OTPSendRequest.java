package com.milkdelivery.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OTPSendRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String type;
}