package com.vaxify.app.service.impl;

import com.vaxify.app.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3ServiceImpl implements S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${app.backend.url}")
    private String backendUrl;

    private static final Pattern SAFE_KEY = Pattern.compile("^[a-f0-9-]{36}_[A-Za-z0-9._-]{1,80}\\.pdf$");

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = buildObjectKey(file.getOriginalFilename());

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("application/pdf")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            log.info("File uploaded to S3: {} (Type: {})", fileName, file.getContentType());

            return fileName;
        } catch (S3Exception e) {
            String details = e.awsErrorDetails() != null
                    ? e.awsErrorDetails().errorCode() + ": " + e.awsErrorDetails().errorMessage()
                    : e.getMessage();
            log.error("S3 upload failed for {}: {}", fileName, details);
            throw new IOException("Failed to upload file to S3", e);
        } catch (Exception e) {
            log.error("S3 upload failed for {}: {}", fileName, e.getMessage(), e);
            throw new IOException("Failed to upload file to S3", e);
        }
    }

    @Override
    public byte[] downloadFile(String fileName) {
        String key = requireSafeKey(fileName);

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
        return objectBytes.asByteArray();
    }

    @Override
    public String deleteFile(String fileName) {
        String key = requireSafeKey(fileName);

        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.deleteObject(deleteObjectRequest);

        log.info("File deleted from S3: {}", fileName);

        return "File deleted: " + fileName;
    }

    @Override
    public String getFileUrl(String fileName) {
        return backendUrl + "/api/files/download/" + fileName;
    }

    @Override
    public String resolveUrl(String path) {
        if (path == null || path.isEmpty()) {
            return path;
        }

        // extract key if it's already an s3 url
        if (path.startsWith("http") && path.contains(".amazonaws.com/")) {
            try {
                int hostEndIndex = path.indexOf(".amazonaws.com/") + ".amazonaws.com/".length();

                String keyWithParams = path.substring(hostEndIndex);

                String key = keyWithParams.contains("?")
                        ? keyWithParams.substring(0, keyWithParams.indexOf("?"))
                        : keyWithParams;

                return backendUrl + "/api/files/download/" + key;
            } catch (Exception e) {
                log.error("failed to extract key from s3 url: {}", path);

                return path;
            }
        }

        // if it's already a full non-s3 url, return as is
        if (path.startsWith("http")) {
            return path;
        }

        // return stable proxy link for stored keys
        return backendUrl + "/api/files/download/" + path;
    }

    private String buildObjectKey(String originalFilename) {
        String base = originalFilename == null ? "document.pdf" : originalFilename.replace('\\', '/');
        int slash = base.lastIndexOf('/');
        if (slash >= 0) {
            base = base.substring(slash + 1);
        }

        String safe = base.replaceAll("[^A-Za-z0-9._-]", "_");
        if (!safe.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            safe = safe + ".pdf";
        }
        if (safe.equals(".pdf") || safe.equals("_.pdf")) {
            safe = "document.pdf";
        }
        if (safe.length() > 80) {
            safe = safe.substring(safe.length() - 80);
            if (!safe.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
                safe = "document.pdf";
            }
        }

        return UUID.randomUUID() + "_" + safe;
    }

    private String requireSafeKey(String fileName) {
        if (fileName == null || !SAFE_KEY.matcher(fileName).matches()) {
            throw new IllegalArgumentException("Invalid file name");
        }
        return fileName;
    }
}
