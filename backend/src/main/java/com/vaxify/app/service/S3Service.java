package com.vaxify.app.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface S3Service {
    String uploadFile(MultipartFile file) throws IOException;

    byte[] downloadFile(String fileName);

    String deleteFile(String fileName);

    String generatePresignedUrl(String fileName);

    String generatePresignedUploadUrl(String fileName, String contentType);

    String resolveUrl(String path);
}
