package com.vento.security;

import com.vento.model.RequestTrace;
import com.vento.repository.RequestTraceRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RequestTraceFilter extends OncePerRequestFilter {

    private final RequestTraceRepository requestTraceRepository;

    public RequestTraceFilter(RequestTraceRepository requestTraceRepository) {
        this.requestTraceRepository = requestTraceRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getRequestURI().startsWith("/h2-console") || request.getRequestURI().startsWith("/api/health")) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            logTrace(requestWrapper, responseWrapper);
            responseWrapper.copyBodyToResponse();
        }
    }

    private void logTrace(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response) {
        try {
            boolean isMultipart = request.getContentType() != null && request.getContentType().startsWith("multipart/");
            String requestBody = isMultipart ? "[MULTIPART DATA OMITTED]" : new String(request.getContentAsByteArray(), StandardCharsets.UTF_8);
            String responseBody = new String(response.getContentAsByteArray(), StandardCharsets.UTF_8);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = (auth != null && auth.isAuthenticated()) ? auth.getName() : "anonymous";

            RequestTrace trace = RequestTrace.builder()
                    .method(request.getMethod())
                    .url(request.getRequestURI())
                    .requestBody(maskSensitiveData(requestBody))
                    .responseBody(maskSensitiveData(responseBody))
                    .status(response.getStatus())
                    .remoteAddr(request.getRemoteAddr())
                    .userEmail(userEmail)
                    .build();

            requestTraceRepository.save(trace);
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Failed to log request trace: " + e.getMessage());
        }
    }

    private String maskSensitiveData(String body) {
        if (body == null || body.isEmpty()) return null;
        String sanitized = body.replace("\0", "");
        if (sanitized.length() > 2000) {
            sanitized = sanitized.substring(0, 2000) + "... [TRUNCATED " + (sanitized.length() - 2000) + " chars]";
        }
        return sanitized.replaceAll("\"password\"\\s*:\\s*\"[^\"]*\"", "\"password\":\"****\"");
    }
}
