package com.vaxify.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class RagClientConfig {

    @Bean
    RestClient ragRestClient(RagProperties ragProperties) {
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofMillis(ragProperties.getConnectTimeoutMs()))
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofMillis(ragProperties.getReadTimeoutMs()));

        return RestClient.builder()
                .baseUrl(trimTrailingSlash(ragProperties.getBaseUrl()))
                .requestFactory(requestFactory)
                .defaultHeader("X-RAG-Internal-Key", ragProperties.getInternalKey())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    private static String trimTrailingSlash(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return baseUrl;
        }
        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }
}
