package com.vaxify.app.exception;

import org.springframework.http.HttpStatus;

/**
 * Classified AI/RAG upstream failure with a stable machine-readable code for clients.
 */
public class AiUpstreamException extends RuntimeException {

    private final String code;
    private final HttpStatus httpStatus;
    private final Integer retryAfterSeconds;
    private final String requestId;

    public AiUpstreamException(
            String code,
            String message,
            HttpStatus httpStatus,
            Integer retryAfterSeconds,
            String requestId
    ) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
        this.retryAfterSeconds = retryAfterSeconds;
        this.requestId = requestId;
    }

    public String getCode() {
        return code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public Integer getRetryAfterSeconds() {
        return retryAfterSeconds;
    }

    public String getRequestId() {
        return requestId;
    }
}
