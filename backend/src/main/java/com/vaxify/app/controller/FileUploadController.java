package com.vaxify.app.controller;

import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.enums.Role;
import com.vaxify.app.exception.ForbiddenException;
import com.vaxify.app.repository.HospitalRepository;
import com.vaxify.app.service.S3Service;
import com.vaxify.app.service.UserService;
import com.vaxify.app.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private static final byte[] PDF_MAGIC = new byte[] { 0x25, 0x50, 0x44, 0x46 }; // %PDF

    private final S3Service s3Service;
    private final SecurityUtils securityUtils;
    private final UserService userService;
    private final HospitalRepository hospitalRepository;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 5MB limit"));
            }

            String contentType = file.getContentType();
            String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
            if (!"application/pdf".equals(contentType) && !originalName.toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are allowed"));
            }

            byte[] bytes = file.getBytes();
            if (bytes.length < 4
                    || bytes[0] != PDF_MAGIC[0]
                    || bytes[1] != PDF_MAGIC[1]
                    || bytes[2] != PDF_MAGIC[2]
                    || bytes[3] != PDF_MAGIC[3]) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are allowed"));
            }

            String fileName = s3Service.uploadFile(file);
            String fileUrl = s3Service.resolveUrl(fileName);

            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", fileUrl);
            response.put("message", "File uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("File upload failed: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload file"));
        }
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String fileName) {
        assertCanDownload(fileName);

        byte[] data = s3Service.downloadFile(fileName);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"document.pdf\"")
                .header("X-Content-Type-Options", "nosniff")
                .body(data);
    }

    private void assertCanDownload(String fileName) {
        String email = securityUtils.getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            throw new ForbiddenException("You are not authorized to access this document");
        }

        User actor = userService.findByEmail(email);

        if (actor.getRole() == Role.ADMIN) {
            return;
        }

        if (actor.getRole() == Role.STAFF) {
            Hospital hospital = hospitalRepository.findByStaffUser(actor)
                    .orElseThrow(() -> new ForbiddenException("You are not authorized to access this document"));

            String stored = hospital.getDocumentUrl();
            String storedKey = s3Service.toStoredKey(stored, stored);
            String requestedKey = s3Service.toStoredKey(fileName, fileName);
            if (Objects.equals(fileName, stored)
                    || Objects.equals(fileName, storedKey)
                    || Objects.equals(requestedKey, stored)
                    || Objects.equals(requestedKey, storedKey)) {
                return;
            }
        }

        throw new ForbiddenException("You are not authorized to access this document");
    }
}
