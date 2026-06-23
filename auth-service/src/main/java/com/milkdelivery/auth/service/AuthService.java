package com.milkdelivery.auth.service;

import com.milkdelivery.auth.config.JwtConfig;
import com.milkdelivery.auth.dto.request.LoginRequest;
import com.milkdelivery.auth.dto.request.RegisterRequest;
import com.milkdelivery.auth.dto.response.AuthResponse;
import com.milkdelivery.auth.dto.response.RefreshTokenResponse;
import com.milkdelivery.auth.dto.response.UserProfileResponse;
import com.milkdelivery.auth.entity.User;
import com.milkdelivery.auth.repository.UserRepository;
import com.milkdelivery.auth.security.JwtUtils;
import com.milkdelivery.auth.security.RedisTokenStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final JwtConfig jwtConfig;
    private final RedisTokenStore redisTokenStore;
    private final RestTemplate restTemplate;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String accessToken = jwtUtils.generateAccessToken(user.getUsername(), user.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .username(user.getUsername())
                .id(user.getId())
                .customerId(user.getCustomerId())
                .deliveryBoyId(user.getDeliveryBoyId())
                .isActive(user.getIsActive())
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadCredentialsException("Username already exists");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadCredentialsException("Invalid role: " + request.getRole());
        }

        boolean isActive = role == User.Role.CUSTOMER ? false : true;

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .customerId(request.getCustomerId())
                .isActive(isActive)
                .build();

        user = userRepository.save(user);

        if (role == User.Role.CUSTOMER && request.getName() != null) {
            createServiceRequest(request, user.getId());
        }

        String accessToken = jwtUtils.generateAccessToken(user.getUsername(), user.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .username(user.getUsername())
                .id(user.getId())
                .customerId(user.getCustomerId())
                .deliveryBoyId(user.getDeliveryBoyId())
                .isActive(user.getIsActive())
                .build();
    }

    public void createServiceRequest(RegisterRequest request, Long userId) {
        try {
            Map<String, Object> srBody = Map.of(
                    "name", request.getName() != null ? request.getName() : "",
                    "phone", request.getPhone() != null ? request.getPhone() : "",
                    "address", request.getAddress() != null ? request.getAddress() : ""
            );
            restTemplate.postForEntity(
                    "http://customer-service/api/service-requests/internal/" + userId,
                    srBody,
                    Void.class
            );
        } catch (Exception e) {
            log.warn("Could not create service request for user {}: {}", userId, e.getMessage());
        }
    }

    @Transactional
    public void activateUser(Long userId, Long customerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found: " + userId));
        user.setIsActive(true);
        user.setCustomerId(customerId);
        userRepository.save(user);
        log.info("User {} activated with customerId {}", userId, customerId);
    }

    public UserProfileResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .customerId(user.getCustomerId())
                .deliveryBoyId(user.getDeliveryBoyId())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null && jwtUtils.validateToken(token)) {
            redisTokenStore.blacklistToken(token, jwtConfig.getAccessExpiration());
        }
    }

    public RefreshTokenResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        String username = jwtUtils.getUsernameFromRefreshToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String newAccessToken = jwtUtils.generateAccessToken(username, user.getRole().name());
        String newRefreshToken = jwtUtils.generateRefreshToken(username);

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }
}
