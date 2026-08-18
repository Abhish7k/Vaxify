package com.vaxify.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// in-memory per-IP limits for the public file endpoints.
// staff registration must upload before login, so these routes stay public;
// this stops a single client from filling the bucket (billing abuse).
@Component
public class FileUploadRateLimitFilter extends OncePerRequestFilter {

    private static final int UPLOAD_LIMIT = 8;
    private static final int DOWNLOAD_LIMIT = 40;
    private static final long WINDOW_SECONDS = 10 * 60;

    private final Map<String, Deque<Long>> uploadHits = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> downloadHits = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path == null || !path.startsWith("/api/files/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean isUpload = "POST".equalsIgnoreCase(request.getMethod()) && path.endsWith("/upload");
        boolean isDownload = "GET".equalsIgnoreCase(request.getMethod()) && path.contains("/download/");

        if (!isUpload && !isDownload) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = clientIp(request);
        int limit = isUpload ? UPLOAD_LIMIT : DOWNLOAD_LIMIT;
        Map<String, Deque<Long>> store = isUpload ? uploadHits : downloadHits;

        if (!allow(store, ip, limit)) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Too many file requests. Try again in a few minutes.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean allow(Map<String, Deque<Long>> store, String ip, int limit) {
        long now = Instant.now().getEpochSecond();
        long cutoff = now - WINDOW_SECONDS;
        Deque<Long> hits = store.computeIfAbsent(ip, key -> new ArrayDeque<>());
        synchronized (hits) {
            while (!hits.isEmpty() && hits.peekFirst() < cutoff) {
                hits.pollFirst();
            }
            if (hits.size() >= limit) {
                return false;
            }
            hits.addLast(now);
            return true;
        }
    }

    private String clientIp(HttpServletRequest request) {
        String cf = request.getHeader("CF-Connecting-IP");
        if (cf != null && !cf.isBlank()) {
            return cf.trim();
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
