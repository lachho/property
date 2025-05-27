package com.property.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for diagnostic endpoints to help troubleshoot API connectivity issues
 */
@RestController
public class DiagnosticController {

    /**
     * Test endpoint at the root path
     * @return Simple JSON response
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> rootEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Server is running");
        response.put("path", "/");
        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint for the API root
     * @return Simple JSON response
     */
    @GetMapping("/api")
    public ResponseEntity<Map<String, Object>> apiRootEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "API is accessible");
        response.put("path", "/api");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Test endpoint for auth route without /api prefix
     * @return Simple JSON response
     */
    @GetMapping("/auth/test")
    public ResponseEntity<Map<String, Object>> authDirectEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Auth direct endpoint is accessible");
        response.put("path", "/auth/test");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Test endpoint for auth route with /api prefix
     * @return Simple JSON response
     */
    @GetMapping("/api/auth/test")
    public ResponseEntity<Map<String, Object>> authApiEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Auth API endpoint is accessible");
        response.put("path", "/api/auth/test");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Diagnostic info endpoint
     * @return Detailed diagnostic information about the application
     */
    @GetMapping("/api/diagnostic")
    public ResponseEntity<Map<String, Object>> diagnosticInfo() {
        Map<String, Object> response = new HashMap<>();
        
        // Basic server info
        response.put("status", "ok");
        response.put("timestamp", System.currentTimeMillis());
        response.put("javaVersion", System.getProperty("java.version"));
        response.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        response.put("freeMemory", Runtime.getRuntime().freeMemory());
        response.put("maxMemory", Runtime.getRuntime().maxMemory());
        
        // Environment info
        Map<String, String> env = new HashMap<>();
        env.put("SPRING_DATASOURCE_URL", System.getenv("SPRING_DATASOURCE_URL"));
        env.put("SPRING_DATASOURCE_USERNAME", "***REDACTED***");
        env.put("PORT", System.getenv("PORT"));
        env.put("FRONTEND_URL", System.getenv("FRONTEND_URL"));
        response.put("environment", env);
        
        return ResponseEntity.ok(response);
    }
} 