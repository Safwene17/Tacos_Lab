package com.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.config.AppProperties;
import com.example.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final AppProperties appProperties;

    public UploadedImage uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Image file is required.");
        }

        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new BusinessException("Only image files are allowed.");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", appProperties.cloudinary().folder(),
                            "resource_type", "image"
                    )
            );

            return new UploadedImage(
                    stringValue(result.get("public_id")),
                    stringValue(result.get("secure_url")),
                    stringValue(result.get("resource_type")),
                    stringValue(result.get("format")),
                    intValue(result.get("width")),
                    intValue(result.get("height")),
                    longValue(result.get("bytes")),
                    stringValue(result.get("version")),
                    appProperties.cloudinary().folder()
            );
        } catch (Exception exception) {
            throw new BusinessException("Failed to upload image to Cloudinary.");
        }
    }

    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception exception) {
            throw new BusinessException("Failed to delete image from Cloudinary.");
        }
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Integer intValue(Object value) {
        return value == null ? null : Integer.valueOf(String.valueOf(value));
    }

    private Long longValue(Object value) {
        return value == null ? null : Long.valueOf(String.valueOf(value));
    }

    public record UploadedImage(
            String publicId,
            String secureUrl,
            String resourceType,
            String format,
            Integer width,
            Integer height,
            Long bytes,
            String version,
            String folder
    ) {
    }
}