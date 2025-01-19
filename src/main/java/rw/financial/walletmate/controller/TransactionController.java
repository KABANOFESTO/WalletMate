package rw.financial.walletmate.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import rw.financial.walletmate.dto.TransactionDto;
import rw.financial.walletmate.exception.ResourceNotFoundException;
import rw.financial.walletmate.model.*;
import rw.financial.walletmate.repository.*;
import rw.financial.walletmate.service.TransactionService;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    // Debug endpoint to check data
    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        
        logger.info("Debug endpoint called by user: {}", userEmail);
        
        Map<String, Object> debugInfo = new HashMap<>();
        
        // Get user info
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null) {
            debugInfo.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole()
            ));
            
            // Get accounts for user
            List<Account> accounts = accountRepository.findByUserId(user.getId());
            debugInfo.put("accounts", accounts.stream().map(account -> Map.of(
                "id", account.getId(),
                "name", account.getName(),
                "type", account.getType(),
                "balance", account.getBalance()
            )).toList());
            
            // Get categories for user
            List<Category> categories = categoryRepository.findByUserId(user.getId());
            debugInfo.put("categories", categories.stream().map(category -> Map.of(
                "id", category.getId(),
                "name", category.getName()
            )).toList());
        } else {
            debugInfo.put("error", "User not found for email: " + userEmail);
        }
        
        return ResponseEntity.ok(debugInfo);
    }

    // Create a new transaction
    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(@Valid @RequestBody TransactionDto transactionDto) {
        logger.info("Creating transaction: {}", transactionDto);
        try {
            TransactionDto createdTransaction = transactionService.createTransaction(transactionDto);
            logger.info("Transaction created successfully: {}", createdTransaction);
            return ResponseEntity.ok(createdTransaction);
        } catch (Exception e) {
            logger.error("Error creating transaction: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Get all transactions for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserTransactions(
            @PathVariable Long userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId) {
        try {
            logger.info("Getting transactions for user: {}", userId);
            List<TransactionDto> transactions = transactionService.getUserTransactions(userId, startDate, endDate, type, categoryId);
            logger.info("Successfully retrieved {} transactions", transactions.size());
            return ResponseEntity.ok(transactions);
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error in getUserTransactions: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred while retrieving transactions"));
        }
    }

    // Get transactions for a specific account
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionDto>> getAccountTransactions(
            @PathVariable Long accountId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(transactionService.getAccountTransactions(accountId, startDate, endDate));
    }

    // Get transactions by date range for a user
    @GetMapping("/user/{userId}/dates")
    public ResponseEntity<List<TransactionDto>> getTransactionsByDateRange(
            @PathVariable Long userId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<TransactionDto> transactions = transactionService.getUserTransactions(userId, startDate.toString(), endDate.toString(), null, null);
        return ResponseEntity.ok(transactions);
    }

    // Get a transaction by ID
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update a transaction
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction) {
        Transaction updatedTransaction = transactionService.updateTransaction(id, transaction);
        return ResponseEntity.ok(updatedTransaction);
    }

    // Delete a transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    // Get transaction summary
    @GetMapping("/summary/{userId}")
    public ResponseEntity<?> getTransactionSummary(
            @PathVariable Long userId,
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(transactionService.getTransactionSummary(userId, period));
    }
}
