package rw.financial.walletmate.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import rw.financial.walletmate.model.Report;
import rw.financial.walletmate.service.ReportService;
import rw.financial.walletmate.exception.ResourceNotFoundException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.springframework.format.annotation.DateTimeFormat.ISO.DATE;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    
    @Autowired
    private ReportService reportService;

    public static class ReportRequest {
        @DateTimeFormat(iso = DATE)
        private LocalDate startDate;
        
        @DateTimeFormat(iso = DATE)
        private LocalDate endDate;

        // Getters and setters
        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }
    }

    // Endpoint to generate a detailed report
    @PostMapping("/user/{userId}/generate")
    public ResponseEntity<?> generateReport(
            @PathVariable Long userId, 
            @RequestBody(required = true) ReportRequest request) {
        logger.info("Generating report for user {} from {} to {}", userId, request.getStartDate(), request.getEndDate());
        try {
            // Validate request parameters
            if (request == null) {
                logger.error("Report request is null for user {}", userId);
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "status", 400,
                        "error", "Bad Request",
                        "message", "Request body is required",
                        "path", "/api/reports/user/" + userId + "/generate"
                    ));
            }

            if (request.getStartDate() == null || request.getEndDate() == null) {
                logger.error("Missing date parameters for user {}. StartDate: {}, EndDate: {}", 
                           userId, request.getStartDate(), request.getEndDate());
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "status", 400,
                        "error", "Bad Request",
                        "message", "Both startDate and endDate are required",
                        "path", "/api/reports/user/" + userId + "/generate"
                    ));
            }
            
            if (request.getStartDate().isAfter(request.getEndDate())) {
                logger.error("Invalid date range for user {}. StartDate: {} is after EndDate: {}", 
                           userId, request.getStartDate(), request.getEndDate());
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "status", 400,
                        "error", "Bad Request",
                        "message", "Start date cannot be after end date",
                        "path", "/api/reports/user/" + userId + "/generate"
                    ));
            }

            Map<String, Object> report = reportService.generateDetailedReport(userId, request.getStartDate(), request.getEndDate());
            logger.info("Successfully generated report for user {}", userId);
            return ResponseEntity.ok(report);

        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found while generating report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Invalid input parameters for report generation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error generating report: {}", e.getMessage(), e);
            e.printStackTrace(); // Add stack trace to console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate report: " + e.getMessage());
        }
    }

    // Endpoint to get reports with optional filters
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReports(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DATE) LocalDate endDate,
            @RequestParam(required = false) String type) {
        try {
            logger.info("Fetching reports for user {} from {} to {}, type: {}", userId, startDate, endDate, type);
            List<Map<String, Object>> reports = reportService.getFilteredReports(userId, startDate, endDate, type);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            logger.error("Error fetching reports: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching reports: " + e.getMessage()));
        }
    }

    // Get transaction summary by category
    @GetMapping("/user/{userId}/summary/category")
    public ResponseEntity<?> getCategorySummary(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DATE) LocalDate endDate) {
        try {
            logger.info("Fetching category summary for user {} from {} to {}", userId, startDate, endDate);
            Map<String, Object> summary = reportService.getCategorySummary(userId, startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Error fetching category summary: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching category summary: " + e.getMessage()));
        }
    }

    // Get account balances and transaction history
    @GetMapping("/user/{userId}/accounts/summary")
    public ResponseEntity<?> getAccountsSummary(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DATE) LocalDate endDate) {
        try {
            logger.info("Fetching accounts summary for user {}", userId);
            Map<String, Object> summary = reportService.getAccountsSummary(userId, startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Error fetching accounts summary: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching accounts summary: " + e.getMessage()));
        }
    }
}
