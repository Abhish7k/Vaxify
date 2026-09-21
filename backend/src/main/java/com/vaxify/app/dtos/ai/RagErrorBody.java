package com.vaxify.app.dtos.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * Safe structured error payload returned by the Python RAG service.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RagErrorBody {

    private String status;
    private String code;
    private String message;

    @JsonProperty("request_id")
    private String requestId;

    @JsonProperty("retry_after_seconds")
    private Integer retryAfterSeconds;
}
