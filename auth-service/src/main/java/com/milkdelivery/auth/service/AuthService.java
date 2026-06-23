package com.milkdelivery.auth.service;

import com.milkdelivery.auth.config.JwtConfig;
import com.milkdelivery.auth.dto.request.LoginRequest;
import com.milkdelivery.auth.dto.request.RegisterRequest;
import com.milkdelivery.auth.dto.response.AuthResponse;
import com.milkdelivery.auth.dto.response.RefreshTokenResponse;
import com.milkdelivery.auth.entity.User;
import com.milkdelivery.auth.repository.UserRepository;
import com.milkdelivery.auth.security.JwtUtils;
import com.milkdelivery.auth.security.RedisTokenStore;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final JwtConfig jwtConfig;
    private final RedisTokenStore redisTokenStore;

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
                .customerId(user.getCustomerId())
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

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .customerId(request.getCustomerId())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtUtils.generateAccessToken(user.getUsername(), user.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .username(user.getUsername())
                .customerId(user.getCustomerId())
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
