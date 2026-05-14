package com.example.backend.service;

import com.example.backend.constant.AppConstants;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class LocaleResolverService {

    public String resolve(String localeQueryParam, String acceptLanguageHeader) {
        if (isSupported(localeQueryParam)) {
            return normalize(localeQueryParam);
        }

        if (isSupported(acceptLanguageHeader)) {
            return normalize(acceptLanguageHeader);
        }

        return AppConstants.DEFAULT_LOCALE;
    }

    public boolean isRomanian(String locale) {
        return AppConstants.ROMANIAN_LOCALE.equals(resolve(locale, null));
    }

    private boolean isSupported(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String normalized = normalize(value);

        return AppConstants.DEFAULT_LOCALE.equals(normalized)
                || AppConstants.ROMANIAN_LOCALE.equals(normalized);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return AppConstants.DEFAULT_LOCALE;
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);

        if (normalized.startsWith(AppConstants.ROMANIAN_LOCALE)) {
            return AppConstants.ROMANIAN_LOCALE;
        }

        if (normalized.startsWith(AppConstants.DEFAULT_LOCALE)) {
            return AppConstants.DEFAULT_LOCALE;
        }

        return AppConstants.DEFAULT_LOCALE;
    }
}