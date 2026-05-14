package com.example.backend.service;

import com.example.backend.config.AppProperties;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshCookieService {

    private final AppProperties appProperties;
    private final RefreshTokenService refreshTokenService;

    public void addRefreshCookie(HttpServletResponse response, String rawRefreshToken) {
        AppProperties.RefreshCookie cookieProperties = appProperties.security().refreshCookie();

        ResponseCookie cookie = ResponseCookie.from(cookieProperties.name(), rawRefreshToken)
                .httpOnly(cookieProperties.httpOnly())
                .secure(cookieProperties.secure())
                .sameSite(cookieProperties.sameSite())
                .path(cookieProperties.path())
                .maxAge(refreshTokenService.refreshTokenExpiresInSeconds())
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearRefreshCookie(HttpServletResponse response) {
        AppProperties.RefreshCookie cookieProperties = appProperties.security().refreshCookie();

        ResponseCookie cookie = ResponseCookie.from(cookieProperties.name(), "")
                .httpOnly(cookieProperties.httpOnly())
                .secure(cookieProperties.secure())
                .sameSite(cookieProperties.sameSite())
                .path(cookieProperties.path())
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}