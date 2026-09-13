package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.ai.AiAskRequest;
import com.vaxify.app.dtos.ai.AiAskResponse;
import com.vaxify.app.dtos.ai.AiCitationDto;
import com.vaxify.app.dtos.ai.RagAskUpstreamResponse;
import com.vaxify.app.exception.ServiceUnavailableException;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.service.AiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiServiceImpl implements AiService {

    private final RestClient ragRestClient;

    public AiServiceImpl(@Qualifier("ragRestClient") RestClient ragRestClient) {
        this.ragRestClient = ragRestClient;
    }

    @Override
    public AiAskResponse ask(AiAskRequest request) {
        String question = request.getQuestion() == null ? "" : request.getQuestion().trim();
        if (question.isBlank()) {
            throw new VaxifyException("Question is required");
        }

        try {
            RagAskUpstreamResponse upstream = ragRestClient.post()
                    .uri("/ask")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("question", question))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        if (res.getStatusCode().value() == 400 || res.getStatusCode().value() == 422) {
                            throw new VaxifyException("Invalid question");
                        }
                        log.warn("RAG client error status={}", res.getStatusCode().value());
                        throw new ServiceUnavailableException("AI service is temporarily unavailable");
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        log.warn("RAG server error status={}", res.getStatusCode().value());
                        throw new ServiceUnavailableException("AI service is temporarily unavailable");
                    })
                    .body(RagAskUpstreamResponse.class);

            if (upstream == null || upstream.getStatus() == null || upstream.getAnswer() == null) {
                throw new ServiceUnavailableException("AI service returned an empty response");
            }

            return mapPublicResponse(upstream);
        } catch (VaxifyException | ServiceUnavailableException ex) {
            throw ex;
        } catch (RestClientResponseException ex) {
            log.warn("RAG HTTP error status={}", ex.getStatusCode().value());
            throw new ServiceUnavailableException("AI service is temporarily unavailable", ex);
        } catch (RestClientException ex) {
            log.warn("RAG connectivity failure: {}", ex.getClass().getSimpleName());
            throw new ServiceUnavailableException("AI service is temporarily unavailable", ex);
        }
    }

    private static AiAskResponse mapPublicResponse(RagAskUpstreamResponse upstream) {
        List<AiCitationDto> citations = upstream.getCitations() == null
                ? Collections.emptyList()
                : upstream.getCitations().stream()
                        .map(c -> AiCitationDto.builder()
                                .source(c.getSource())
                                .sourceId(c.getSourceId())
                                .sourcePath(c.getSourcePath())
                                .pageStart(c.getPageStart())
                                .pageEnd(c.getPageEnd())
                                .section(c.getSection())
                                .topic(c.getTopic())
                                .preview(c.getPreview())
                                .build())
                        .toList();

        return AiAskResponse.builder()
                .status(upstream.getStatus())
                .answer(upstream.getAnswer())
                .citations(citations)
                .build();
    }
}
