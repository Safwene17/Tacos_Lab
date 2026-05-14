package com.example.backend.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record PublicMenuResponse(
        List<PublicMenuCategoryGroupResponse> categories
) {
}