package com.example.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        int status,
        String message,
        T data,
        Map<String, String> errors,
        Instant timestamp
) {

    public static <T> ApiResponse<T> ok(String message,T data) {
        return new ApiResponse<>(true, 200, message, data, null, Instant.now());
    }

//    public static <T> ApiResponse<T> created(T data) {
//        return new ApiResponse<>(true, 201, "Created", data, null, Instant.now());
//    }



    public static <T> ApiResponse<T> error(int status, String message) {
        return new ApiResponse<>(false, status, message, null, null, Instant.now());
    }

    public static <T> ApiResponse<T> error(int status, String message, Map<String, String> errors) {
        return new ApiResponse<>(false, status, message, null, errors, Instant.now());
    }
}