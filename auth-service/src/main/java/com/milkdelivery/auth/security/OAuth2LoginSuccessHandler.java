package com.milkdelivery.auth.security;

import com.milkdelivery.auth.entity.User;
import com.milkdelivery.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        Map<String, Object> attributes = token.getPrincipal().getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        if (email == null) {
            response.sendRedirect(redirectUri + "?error=email_not_found");
            return;
        }

        User user = userRepository.findByUsername(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .username(email)
                    .password("") 
                    .role(User.Role.CUSTOMER)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
            log.info("New user created via Google OAuth: {}", email);
        }

        String accessToken = jwtUtils.generateAccessToken(user.getUsername(), user.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(user.getUsername());

        String url = String.format("%s?accessToken=%s&refreshToken=%s&role=%s&username=%s&id=%d",
                redirectUri, accessToken, refreshToken, user.getRole().name(),
                user.getUsername(), user.getId());

        if (user.getCustomerId() != null) {
            url += "&customerId=" + user.getCustomerId();
        }
        if (user.getDeliveryBoyId() != null) {
            url += "&deliveryBoyId=" + user.getDeliveryBoyId();
        }

        response.sendRedirect(url);
    }
}
