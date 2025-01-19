package rw.financial.walletmate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.financial.walletmate.dto.TransactionDto;
import rw.financial.walletmate.model.*;
import rw.financial.walletmate.repository.*;
import rw.financial.walletmate.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BudgetService budgetService;

    private void validateUserAccess(Long accountId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

        if (!account.getUser().getEmail().equals(auth.getName())) {
            throw new ResourceNotFoundException("Access denied for account: " + accountId);
        }
    }

    @PreAuthorize("hasRole('USER')")
    @Transactional
    public TransactionDto createTransaction(TransactionDto dto) {
        try {
            logger.info("Creating transaction: {}", dto);

            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                throw new ResourceNotFoundException("No authenticated user found");
            }

            logger.debug("Getting user for email: {}", auth.getName());
            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + auth.getName()));

            logger.debug("Getting account with ID: {}", dto.getAccountId());
            Account account = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Account not found with id: " + dto.getAccountId()));

            logger.debug("Getting category with ID: {}", dto.getCategoryId());
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

            // Validate transaction type
            String type = dto.getType().toUpperCase();
            if (!type.equals("INCOME") && !type.equals("EXPENSE")) {
                throw new IllegalArgumentException(
                        "Invalid transaction type: " + type + ". Must be either INCOME or EXPENSE");
            }

            Transaction transaction = new Transaction();
            transaction.setUser(user);
            transaction.setAccount(account);
            transaction.setCategory(category);
            transaction.setType(type);
            transaction.setAmount(dto.getAmount());
            transaction.setDescription(dto.getDescription());
            transaction.setDate(LocalDate.now());
            transaction.setCreatedAt(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());

            if (dto.getSubcategoryId() != null) {
                logger.debug("Getting subcategory with ID: {}", dto.getSubcategoryId());
                Subcategory subcategory = subcategoryRepository.findById(dto.getSubcategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Subcategory not found with id: " + dto.getSubcategoryId()));
                transaction.setSubcategory(subcategory);
            }

            // Update account balance
            BigDecimal currentBalance = account.getBalance() != null ? account.getBalance() : BigDecimal.ZERO;
            if (type.equals("EXPENSE")) {
                account.setBalance(currentBalance.subtract(transaction.getAmount()));
            } else {
                account.setBalance(currentBalance.add(transaction.getAmount()));
            }

            logger.debug("Saving transaction");
            transaction = transactionRepository.save(transaction);

            logger.debug("Updating account balance");
            accountRepository.save(account);

            if (type.equals("EXPENSE")) {
                logger.debug("Checking budget limits");
                budgetService.checkBudgetLimits(transaction);
            }

            logger.info("Transaction created successfully with ID: {}", transaction.getId());
            return mapToDto(transaction);

        } catch (Exception e) {
            logger.error("Error creating transaction: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PreAuthorize("hasRole('USER')")
    public List<TransactionDto> getUserTransactions(Long userId, String startDate, String endDate, String type,
            Long categoryId) {
        logger.info("Getting user transactions. UserId: {}, StartDate: {}, EndDate: {}, Type: {}, CategoryId: {}",
                userId, startDate, endDate, type, categoryId);

        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                logger.error("No authentication found");
                throw new ResourceNotFoundException("User not authenticated");
            }

            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> {
                        logger.error("User not found for email: {}", auth.getName());
                        return new ResourceNotFoundException("User not found");
                    });

            // Verify the requested userId matches the authenticated user
            if (!user.getId().equals(userId)) {
                logger.error("Access denied. User {} attempted to access transactions for user {}", user.getId(),
                        userId);
                throw new ResourceNotFoundException("Access denied. You can only view your own transactions.");
            }

            LocalDate start;
            LocalDate end;

            try {
                start = startDate != null ? LocalDate.parse(startDate)
                        : LocalDate.now().minusMonths(1);
                end = endDate != null ? LocalDate.parse(endDate).plusDays(1)
                        : LocalDate.now().plusDays(1);
            } catch (Exception e) {
                logger.error("Error parsing dates. StartDate: {}, EndDate: {}", startDate, endDate, e);
                throw new IllegalArgumentException("Invalid date format. Please use yyyy-MM-dd format");
            }

            List<Transaction> transactions;

            try {
                if (categoryId != null) {
                    logger.debug("Fetching transactions by category. CategoryId: {}", categoryId);
                    transactions = transactionRepository.findByUserIdAndCategoryIdAndDateBetween(userId, categoryId,
                            start, end);
                } else if (type != null) {
                    logger.debug("Fetching transactions by type. Type: {}", type);
                    type = type.toUpperCase();
                    if (!type.equals("INCOME") && !type.equals("EXPENSE")) {
                        throw new IllegalArgumentException(
                                "Invalid transaction type. Must be either INCOME or EXPENSE");
                    }
                    transactions = transactionRepository.findByUserIdAndTypeAndDateBetween(userId, type, start, end);
                } else {
                    logger.debug("Fetching all transactions for user");
                    transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
                }
            } catch (Exception e) {
                logger.error("Database error while fetching transactions", e);
                throw new RuntimeException("Error retrieving transactions", e);
            }

            logger.debug("Found {} transactions", transactions.size());

            try {
                List<TransactionDto> dtos = transactions.stream()
                        .map(this::mapToDto)
                        .collect(Collectors.toList());
                logger.info("Successfully mapped {} transactions to DTOs", dtos.size());
                return dtos;
            } catch (Exception e) {
                logger.error("Error mapping transactions to DTOs", e);
                throw new RuntimeException("Error processing transactions", e);
            }
        } catch (Exception e) {
            logger.error("Error in getUserTransactions: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PreAuthorize("hasRole('USER')")
    public List<TransactionDto> getAccountTransactions(Long accountId, String startDate, String endDate) {
        try {
            logger.info("Getting account transactions for account ID: {}", accountId);

            validateUserAccess(accountId);

            LocalDateTime start;
            LocalDateTime end;

            try {
                start = startDate != null ? LocalDate.parse(startDate).atStartOfDay()
                        : LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
                end = endDate != null ? LocalDate.parse(endDate).plusDays(1).atStartOfDay()
                        : LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            } catch (Exception e) {
                logger.error("Error parsing dates. StartDate: {}, EndDate: {}", startDate, endDate, e);
                throw new IllegalArgumentException("Invalid date format. Please use yyyy-MM-dd format");
            }

            logger.debug("Getting transactions for account ID: {}", accountId);
            List<Transaction> transactions = transactionRepository.findByAccountIdAndDateBetween(accountId, start.toLocalDate(), end.toLocalDate());

            logger.debug("Mapping transactions to DTOs");
            return transactions.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error getting account transactions: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PreAuthorize("hasRole('USER')")
    public Map<String, Object> getTransactionSummary(Long userId, String period) {
        try {
            logger.info("Getting transaction summary for user ID: {}", userId);

            LocalDateTime startDate;
            LocalDateTime endDate = LocalDateTime.now();

            switch (period != null ? period.toLowerCase() : "month") {
                case "week":
                    startDate = endDate.minusWeeks(1);
                    break;
                case "year":
                    startDate = endDate.minusYears(1);
                    break;
                default:
                    startDate = endDate.minusMonths(1);
            }

            logger.debug("Getting transactions for user ID: {}", userId);
            List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate.toLocalDate(), endDate.toLocalDate());

            logger.debug("Calculating transaction summary");
            BigDecimal totalIncome = transactions.stream()
                    .filter(t -> t.getType().equals("INCOME"))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalExpense = transactions.stream()
                    .filter(t -> t.getType().equals("EXPENSE"))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<Category, BigDecimal> expensesByCategory = transactions.stream()
                    .filter(t -> t.getType().equals("EXPENSE"))
                    .collect(Collectors.groupingBy(
                            Transaction::getCategory,
                            Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

            logger.debug("Returning transaction summary");
            return Map.of(
                    "totalIncome", totalIncome,
                    "totalExpense", totalExpense,
                    "balance", totalIncome.subtract(totalExpense),
                    "expensesByCategory", expensesByCategory.entrySet().stream()
                            .collect(Collectors.toMap(
                                    entry -> entry.getKey().getName(),
                                    Map.Entry::getValue)));
        } catch (Exception e) {
            logger.error("Error getting transaction summary: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PreAuthorize("hasRole('USER')")
    public Optional<Transaction> getTransactionById(Long id) {
        try {
            logger.info("Getting transaction by ID: {}", id);

            Transaction transaction = transactionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
            validateUserAccess(transaction.getAccount().getId());
            return Optional.of(transaction);
        } catch (Exception e) {
            logger.error("Error getting transaction by ID: {}", e.getMessage(), e);
            throw e;
        }
    }

    private TransactionDto mapToDto(Transaction transaction) {
        try {
            if (transaction == null) {
                logger.error("Cannot map null transaction to DTO");
                throw new IllegalArgumentException("Transaction cannot be null");
            }

            logger.debug("Mapping transaction to DTO: {}", transaction.getId());
            TransactionDto dto = new TransactionDto();
            
            // Set basic fields with null checks
            dto.setId(transaction.getId());
            
            // User information
            if (transaction.getUser() != null) {
                dto.setUserId(transaction.getUser().getId());
            }
            
            // Account information
            if (transaction.getAccount() != null) {
                dto.setAccountId(transaction.getAccount().getId());
                dto.setAccountName(transaction.getAccount().getName() != null ? 
                    transaction.getAccount().getName() : "Unknown Account");
            }
            
            // Transaction details
            dto.setType(transaction.getType());
            dto.setAmount(transaction.getAmount() != null ? transaction.getAmount() : BigDecimal.ZERO);
            dto.setDescription(transaction.getDescription());
            
            // Date handling
            if (transaction.getDate() != null) {
                dto.setDate(transaction.getDate());
            } else {
                dto.setDate(LocalDate.now()); // Default to current date if null
            }
            
            // Category information
            if (transaction.getCategory() != null) {
                dto.setCategoryId(transaction.getCategory().getId());
                dto.setCategoryName(transaction.getCategory().getName() != null ? 
                    transaction.getCategory().getName() : "Uncategorized");
            } else {
                dto.setCategoryName("Uncategorized");
            }
            
            // Subcategory information (optional)
            if (transaction.getSubcategory() != null) {
                dto.setSubcategoryId(transaction.getSubcategory().getId());
                dto.setSubcategoryName(transaction.getSubcategory().getName());
            }
            
            return dto;
        } catch (Exception e) {
            logger.error("Error mapping transaction to DTO: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PreAuthorize("hasRole('USER')")
    @Transactional
    public Transaction updateTransaction(Long id, Transaction updatedTransaction) {
        try {
            logger.info("Updating transaction with ID: {}", id);

            Transaction existingTransaction = transactionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

            validateUserAccess(existingTransaction.getAccount().getId());

            Account account = existingTransaction.getAccount();

            if (existingTransaction.getType().equals("EXPENSE")) {
                account.setBalance(account.getBalance().add(existingTransaction.getAmount()));
            } else {
                account.setBalance(account.getBalance().subtract(existingTransaction.getAmount()));
            }

            existingTransaction.setAmount(updatedTransaction.getAmount());
            existingTransaction.setDescription(updatedTransaction.getDescription());
            existingTransaction.setDate(updatedTransaction.getDate());
            existingTransaction.setType(updatedTransaction.getType());

            if (updatedTransaction.getCategory() != null) {
                existingTransaction.setCategory(updatedTransaction.getCategory());
            }
            if (updatedTransaction.getSubcategory() != null) {
                existingTransaction.setSubcategory(updatedTransaction.getSubcategory());
            }

            if (existingTransaction.getType().equals("EXPENSE")) {
                account.setBalance(account.getBalance().subtract(existingTransaction.getAmount()));
            } else {
                account.setBalance(account.getBalance().add(existingTransaction.getAmount()));
            }

            accountRepository.save(account);
            return transactionRepository.save(existingTransaction);
        } catch (Exception e) {
            logger.error("Error updating transaction: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PreAuthorize("hasRole('USER')")
    @Transactional
    public void deleteTransaction(Long id) {
        try {
            logger.info("Deleting transaction with ID: {}", id);

            Transaction transaction = transactionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

            validateUserAccess(transaction.getAccount().getId());

            Account account = transaction.getAccount();
            if (transaction.getType().equals("EXPENSE")) {
                account.setBalance(account.getBalance().add(transaction.getAmount()));
            } else {
                account.setBalance(account.getBalance().subtract(transaction.getAmount()));
            }

            accountRepository.save(account);
            transactionRepository.delete(transaction);
        } catch (Exception e) {
            logger.error("Error deleting transaction: {}", e.getMessage(), e);
            throw e;
        }
    }
}