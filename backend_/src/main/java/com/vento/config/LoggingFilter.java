package com.vento.config;

import com.vento.model.RequestTrace;
import com.vento.repository.RequestTraceRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class LoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);
    private final RequestTraceRepository requestTraceRepository;

    public LoggingFilter(RequestTraceRepository requestTraceRepository) {
        this.requestTraceRepository = requestTraceRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        
        // Wrap request and response to cache body
        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long timeTaken = System.currentTimeMillis() - startTime;
            
            saveTrace(requestWrapper, responseWrapper, timeTaken);
            
            log.info("Finished request: method={} uri={} status={} time_taken_ms={}",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), timeTaken);

            responseWrapper.copyBodyToResponse();
        }
    }

    private void saveTrace(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response, long timeTaken) {
        try {
            String uri = request.getRequestURI();
            
            // Skip tracing for very frequent or static resource requests if needed
            if (uri.contains("/api/avatars/") || uri.endsWith(".ico") || uri.endsWith(".png")) {
                return;
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = (auth != null && auth.isAuthenticated()) ? auth.getName() : "Anonymous";

            String requestBody = "";
            String responseBody = "";

            // Skip large/binary bodies for file operations
            boolean skipBody = uri.contains("/upload") || uri.contains("/download") || request.getContentType() != null && request.getContentType().contains("multipart");

            if (!skipBody) {
                byte[] requestArray = request.getContentAsByteArray();
                if (requestArray.length > 0) {
                    requestBody = new String(requestArray, 0, Math.min(requestArray.length, 5000), StandardCharsets.UTF_8);
                }

                byte[] responseArray = response.getContentAsByteArray();
                if (responseArray.length > 0) {
                    responseBody = new String(responseArray, 0, Math.min(responseArray.length, 5000), StandardCharsets.UTF_8);
                }
            } else {
                requestBody = "[BINARY OR LARGE PAYLOAD SKIPPED]";
                responseBody = "[BINARY OR LARGE PAYLOAD SKIPPED]";
            }

            RequestTrace trace = RequestTrace.builder()
                    .method(request.getMethod())
                    .url(uri)
                    .status(response.getStatus())
                    .remoteAddr(request.getRemoteAddr())
                    .userEmail(userEmail)
                    .requestBody(requestBody)
                    .responseBody(responseBody)
                    .build();

            requestTraceRepository.save(trace);
        } catch (Exception e) {
            log.warn("Failed to save request trace: {}", e.getMessage());
        }
    }
}
