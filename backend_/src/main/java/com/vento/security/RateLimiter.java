package com.vento.security;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimiter {

    private final ConcurrentMap<String, RateInfo> loginAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 15 * 60 * 1000; // 15 minutes

    public boolean isRateLimited(String key) {
        RateInfo info = loginAttempts.get(key);
        if (info == null) return false;

        if (System.currentTimeMillis() - info.windowStart > WINDOW_MS) {
            loginAttempts.remove(key);
            return false;
        }
        return info.attempts.get() >= MAX_ATTEMPTS;
    }

    public void recordAttempt(String key) {
        loginAttempts.compute(key, (k, existing) -> {
            if (existing == null || System.currentTimeMillis() - existing.windowStart > WINDOW_MS) {
                return new RateInfo(System.currentTimeMillis(), new AtomicInteger(1));
            }
            existing.attempts.incrementAndGet();
            return existing;
        });
    }

    public void resetAttempts(String key) {
        loginAttempts.remove(key);
    }

    private static class RateInfo {
        final long windowStart;
        final AtomicInteger attempts;

        RateInfo(long windowStart, AtomicInteger attempts) {
            this.windowStart = windowStart;
            this.attempts = attempts;
        }
    }
}
