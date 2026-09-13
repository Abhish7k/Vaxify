package com.vaxify.app.dtos.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Upstream RAG service payload (snake_case). Not exposed on the public API.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RagAskUpstreamResponse {

    private String query;

    private String status;

    private String answer;

    @JsonProperty("abstention_reason")
    private String abstentionReason;

    private List<RagCitationUpstream> citations = new ArrayList<>();

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RagCitationUpstream {

        @JsonProperty("chunk_id")
        private String chunkId;

        private String source;

        @JsonProperty("source_id")
        private String sourceId;

        @JsonProperty("source_path")
        private String sourcePath;

        @JsonProperty("page_start")
        private Integer pageStart;

        @JsonProperty("page_end")
        private Integer pageEnd;

        private String section;

        private String topic;

        private Double score;

        private String preview;
    }
}
