package com.milkdelivery.notification.dto;

import lombok.Data;

@Data
public class OTPEvent {
    private String username;
    private String type;
    private String code;
}