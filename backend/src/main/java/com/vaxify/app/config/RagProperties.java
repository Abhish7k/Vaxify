package com.vaxify.app.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Component
@Validated
@ConfigurationProperties(prefix = "app.rag")
public class RagProperties {

    @NotBlank(message = "RAG_SERVICE_URL / app.rag.base-url must be set")
    private String baseUrl = "http://localhost:8001";

    @Min(1)
    private int connectTimeoutMs = 5000;

    @Min(1)
    private int readTimeoutMs = 60000;

    @NotBlank(message = "RAG_INTERNAL_KEY / app.rag.internal-key must be set")
    private String internalKey;
}
