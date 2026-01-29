package com.vaxify.app.controller;

import com.vaxify.app.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Adjust for production
public class FileUploadController {

    private final S3Service s3Service;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Limit file size (5MB as defined in application.properties)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 5MB limit"));
            }

            // Validate file type (PDF only for now as requested)
            if (!"application/pdf".equals(file.getContentType())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are allowed"));
            }

            String fileName = s3Service.uploadFile(file);
            String fileUrl = s3Service.generatePresignedUrl(fileName);

            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", fileUrl);
            response.put("message", "File uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/presigned-upload-url")
    public ResponseEntity<Map<String, String>> getPresignedUploadUrl(
            @RequestParam String fileName,
            @RequestParam String contentType) {

        String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
        String uploadUrl = s3Service.generatePresignedUploadUrl(uniqueFileName, contentType);

        Map<String, String> response = new HashMap<>();
        response.put("fileName", uniqueFileName);
        response.put("uploadUrl", uploadUrl);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String fileName) {
        byte[] data = s3Service.downloadFile(fileName);
        return ResponseEntity.ok()
                .header("Content-type", "application/octet-stream")
                .header("Content-disposition", "attachment; filename=\"" + fileName + "\"")
                .body(data);
    }
}
