package com.example.backend.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

class LocaleResolverServiceTest {

    private final LocaleResolverService service = new LocaleResolverService();

    @Test
    void resolveReturnsQueryParamLocaleFirst() {
        assertThat(service.resolve("ro", "en-US")).isEqualTo("ro");
    }

    @Test
    void resolveFallsBackToAcceptLanguage() {
        assertThat(service.resolve(null, "ro-RO")).isEqualTo("ro");
    }

    @Test
    void resolveDefaultsToEnglishForUnsupportedLocale() {
        assertThat(service.resolve("fr", null)).isEqualTo("en");
    }

    @Test
    void isRomanianReturnsTrueForRomanianLocale() {
        assertThat(service.isRomanian("ro")).isTrue();
    }

    @Test
    void isRomanianReturnsFalseForEnglishLocale() {
        assertThat(service.isRomanian("en")).isFalse();
    }
}