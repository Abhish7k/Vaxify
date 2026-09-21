package com.vaxify.app.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vaxify.app.dtos.ai.AiAskRequest;
import com.vaxify.app.dtos.ai.AiAskResponse;
import com.vaxify.app.dtos.ai.AiCitationDto;
import com.vaxify.app.dtos.ai.RagAskUpstreamResponse;
import com.vaxify.app.dtos.ai.RagErrorBody;
import com.vaxify.app.exception.AiUpstreamException;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.service.AiService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.io.InputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class AiServiceImpl implements AiService {

    public static final String REQUEST_ID_HEADER = "X-Request-Id";

    private static final String CODE_VALIDATION = "validation_error";
    private static final String CODE_UNAUTHORIZED = "unauthorized";
    private static final String CODE_RATE_LIMITED = "rate_limited";
    private static final String CODE_AI_PROVIDER = "ai_provider_error";
    private static final String CODE_UNAVAILABLE = "service_unavailable";
    private static final String CODE_TIMEOUT = "timeout";
    private static final String CODE_UNKNOWN = "unknown";

    private final RestClient ragRestClient;
    private final ObjectMapper objectMapper;

    public AiServiceImpl(
            @Qualifier("ragRestClient") RestClient ragRestClient,
            ObjectMapper objectMapper
    ) {
        this.ragRestClient = ragRestClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public AiAskResponse ask(AiAskRequest request) {
        String question = request.getQuestion() == null ? "" : request.getQuestion().trim();
        if (question.isBlank()) {
            throw new VaxifyException("Question is required");
        }

        String requestId = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        MDC.put("requestId", requestId);
        try {
            log.info(
                    "AI ask start requestId={} stage=gateway provider=rag questionChars={}",
                    requestId,
                    question.length()
            );

            RagAskUpstreamResponse upstream = ragRestClient.post()
                    .uri("/ask")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(REQUEST_ID_HEADER, requestId)
                    .body(Map.of("question", question))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        RagErrorBody parsed = readErrorBody(res.getBody());
                        throw toUpstreamException(res.getStatusCode().value(), parsed, requestId);
                    })
                    .body(RagAskUpstreamResponse.class);

            if (upstream == null || upstream.getStatus() == null || upstream.getAnswer() == null) {
                log.warn(
                        "RAG empty response requestId={} stage=gateway provider=rag",
                        requestId
                );
                throw new AiUpstreamException(
                        CODE_UNAVAILABLE,
                        "AI service returned an empty response",
                        HttpStatus.SERVICE_UNAVAILABLE,
                        null,
                        requestId
                );
            }

            log.info(
                    "AI ask success requestId={} stage=gateway provider=rag status={} citationCount={}",
                    requestId,
                    upstream.getStatus(),
                    upstream.getCitations() == null ? 0 : upstream.getCitations().size()
            );
            return mapPublicResponse(upstream);
        } catch (AiUpstreamException | VaxifyException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            boolean timedOut = looksLikeTimeout(ex);
            String code = timedOut ? CODE_TIMEOUT : CODE_UNAVAILABLE;
            HttpStatus status = timedOut ? HttpStatus.GATEWAY_TIMEOUT : HttpStatus.SERVICE_UNAVAILABLE;
            log.warn(
                    "RAG connectivity failure requestId={} stage=gateway provider=rag code={} exceptionType={} detail={}",
                    requestId,
                    code,
                    ex.getClass().getSimpleName(),
                    safeDetail(ex)
            );
            throw new AiUpstreamException(
                    code,
                    timedOut ? "AI service request timed out" : "AI service is temporarily unavailable",
                    status,
                    null,
                    requestId
            );
        } catch (RestClientResponseException ex) {
            RagErrorBody parsed = parseErrorJson(ex.getResponseBodyAsString());
            throw toUpstreamException(ex.getStatusCode().value(), parsed, requestId);
        } catch (RestClientException ex) {
            log.warn(
                    "RAG client failure requestId={} stage=gateway provider=rag code={} exceptionType={} detail={}",
                    requestId,
                    CODE_UNAVAILABLE,
                    ex.getClass().getSimpleName(),
                    safeDetail(ex)
            );
            throw new AiUpstreamException(
                    CODE_UNAVAILABLE,
                    "AI service is temporarily unavailable",
                    HttpStatus.SERVICE_UNAVAILABLE,
                    null,
                    requestId
            );
        } finally {
            MDC.remove("requestId");
        }
    }

    private AiUpstreamException toUpstreamException(int status, RagErrorBody body, String requestId) {
        String code = normalizeCode(body != null ? body.getCode() : null, status);
        String message = body != null && body.getMessage() != null && !body.getMessage().isBlank()
                ? body.getMessage()
                : defaultMessage(code);
        Integer retryAfter = body != null ? body.getRetryAfterSeconds() : null;
        String upstreamRequestId = body != null && body.getRequestId() != null && !body.getRequestId().isBlank()
                ? body.getRequestId()
                : requestId;

        log.warn(
                "RAG upstream error requestId={} stage=gateway provider=rag code={} httpStatus={} retryAfterSeconds={}",
                upstreamRequestId,
                code,
                status,
                retryAfter
        );

        return new AiUpstreamException(code, message, httpStatusForCode(code, status), retryAfter, upstreamRequestId);
    }

    private static String normalizeCode(String code, int status) {
        if (code != null && !code.isBlank()) {
            return code.trim();
        }
        return switch (status) {
            case 400, 422 -> CODE_VALIDATION;
            case 401, 403 -> CODE_UNAUTHORIZED;
            case 429 -> CODE_RATE_LIMITED;
            case 504 -> CODE_TIMEOUT;
            case 502, 503 -> CODE_UNAVAILABLE;
            default -> status >= 500 ? CODE_UNKNOWN : CODE_UNAVAILABLE;
        };
    }

    private static HttpStatus httpStatusForCode(String code, int upstreamStatus) {
        return switch (code) {
            case CODE_VALIDATION -> HttpStatus.BAD_REQUEST;
            case CODE_UNAUTHORIZED -> HttpStatus.UNAUTHORIZED;
            case CODE_RATE_LIMITED -> HttpStatus.TOO_MANY_REQUESTS;
            case CODE_TIMEOUT -> HttpStatus.GATEWAY_TIMEOUT;
            case CODE_AI_PROVIDER, CODE_UNAVAILABLE -> HttpStatus.SERVICE_UNAVAILABLE;
            case CODE_UNKNOWN -> HttpStatus.INTERNAL_SERVER_ERROR;
            default -> HttpStatus.resolve(upstreamStatus) != null
                    ? HttpStatus.resolve(upstreamStatus)
                    : HttpStatus.SERVICE_UNAVAILABLE;
        };
    }

    private static String defaultMessage(String code) {
        return switch (code) {
            case CODE_VALIDATION -> "Invalid question";
            case CODE_UNAUTHORIZED -> "Unauthorized";
            case CODE_RATE_LIMITED -> "AI provider is temporarily busy";
            case CODE_AI_PROVIDER -> "AI provider error";
            case CODE_TIMEOUT -> "AI service request timed out";
            case CODE_UNKNOWN -> "Unexpected AI service error";
            default -> "AI service is temporarily unavailable";
        };
    }

    private RagErrorBody readErrorBody(InputStream body) {
        if (body == null) {
            return null;
        }
        try {
            String raw = new String(body.readAllBytes(), StandardCharsets.UTF_8);
            return parseErrorJson(raw);
        } catch (Exception ex) {
            log.debug("Could not read RAG error body: {}", ex.getClass().getSimpleName());
            return null;
        }
    }

    private RagErrorBody parseErrorJson(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(raw, RagErrorBody.class);
        } catch (Exception ex) {
            RagErrorBody fallback = new RagErrorBody();
            fallback.setMessage(raw.length() > 200 ? raw.substring(0, 200) : raw);
            return fallback;
        }
    }

    private static boolean looksLikeTimeout(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            String name = current.getClass().getSimpleName().toLowerCase();
            String message = current.getMessage() == null ? "" : current.getMessage().toLowerCase();
            if (name.contains("timeout") || message.contains("timed out") || message.contains("timeout")) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private static String safeDetail(Throwable ex) {
        String message = ex.getMessage();
        if (message == null || message.isBlank()) {
            return ex.getClass().getSimpleName();
        }
        return message.length() > 200 ? message.substring(0, 200) : message;
    }

    private static AiAskResponse mapPublicResponse(RagAskUpstreamResponse upstream) {
        List<AiCitationDto> citations = upstream.getCitations() == null
                ? Collections.emptyList()
                : upstream.getCitations().stream()
                        .map(AiServiceImpl::mapCitation)
                        .toList();

        return AiAskResponse.builder()
                .status(upstream.getStatus())
                .answer(upstream.getAnswer())
                .citations(citations)
                .build();
    }

    private static AiCitationDto mapCitation(RagAskUpstreamResponse.RagCitationUpstream citation) {
        return AiCitationDto.builder()
                .source(citation.getSource())
                .sourceId(blankToNull(citation.getSourceId()))
                .title(blankToNull(citation.getTitle()))
                .publisher(blankToNull(citation.getPublisher()))
                .documentDate(blankToNull(citation.getDocumentDate()))
                .sourceUrl(trustedHttpsUrl(citation.getSourceUrl()))
                .pageStart(presentPage(citation.getPageStart()))
                .pageEnd(presentPage(citation.getPageEnd()))
                .section(citation.getSection())
                .topic(citation.getTopic())
                .build();
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private static Integer presentPage(Integer page) {
        if (page == null || page < 1) {
            return null;
        }
        return page;
    }

    /**
     * Forwards only absolute HTTPS URLs already resolved by the RAG service.
     * Malformed values are dropped so one bad citation cannot fail the answer.
     */
    private static String trustedHttpsUrl(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if (!trimmed.startsWith("https://")) {
            return null;
        }
        try {
            URI uri = URI.create(trimmed);
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null || uri.getHost().isBlank()) {
                return null;
            }
            return trimmed;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
