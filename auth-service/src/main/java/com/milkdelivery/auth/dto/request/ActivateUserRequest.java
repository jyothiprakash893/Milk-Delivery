package com.milkdelivery.auth.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivateUserRequest {
    private Long customerId;
}
