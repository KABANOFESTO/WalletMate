package rw.financial.walletmate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.financial.walletmate.exception.ResourceNotFoundException;
import rw.financial.walletmate.model.*;
import rw.financial.walletmate.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportService {
    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = false)
    public Map<String, Object> generateDetailedReport(Long userId, LocalDate startDate, LocalDate endDate) {
        logger.info("Starting to generate detailed report for user {} from {} to {}", userId, startDate, endDate);
        Map<String, Object> response = new HashMap<>();

        try {
            // Input validation
            if (userId == null || startDate == null || endDate == null) {
                logger.error("Missing required parameters: userId={}, startDate={}, endDate={}", userId, startDate,
                        endDate);
                throw new IllegalArgumentException("User ID, start date, and end date are required");
            }
            if (startDate.isAfter(endDate)) {
                logger.error("Invalid date range: startDate {} is after endDate {}", startDate, endDate);
                throw new IllegalArgumentException("Start date cannot be after end date");
            }

            // Verify user exists
            logger.debug("Looking up user with ID: {}", userId);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("User not found with ID: {}", userId);
                        return new ResourceNotFoundException("User not found with id: " + userId);
                    });
            logger.debug("Found user: {}", user.getEmail());

            // Get transactions for the period
            logger.debug("Fetching transactions for user {} between {} and {}", userId, startDate, endDate);
            List<Transaction> transactions;
            try {
                transactions = transactionRepository.findByDateBetweenAndUserId(startDate, endDate, userId);
                logger.debug("Found {} transactions", transactions.size());
            } catch (Exception e) {
                logger.error("Error fetching transactions: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to fetch transactions: " + e.getMessage(), e);
            }

            // Initialize summary data
            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;
            Map<String, Map<String, Object>> categoryBreakdown = new HashMap<>();
            Map<String, Map<String, Object>> accountSummary = new HashMap<>();

            // Process transactions
            logger.debug("Processing {} transactions", transactions.size());
            for (Transaction transaction : transactions) {
                try {
                    if (transaction == null) {
                        logger.warn("Encountered null transaction, skipping");
                        continue;
                    }

                    logger.trace("Processing transaction: id={}, type={}, amount={}",
                            transaction.getId(), transaction.getType(), transaction.getAmount());

                    BigDecimal amount = transaction.getAmount() != null ? transaction.getAmount() : BigDecimal.ZERO;
                    String transactionType = transaction.getType();

                    if (transactionType == null) {
                        logger.warn("Transaction {} has null type, skipping", transaction.getId());
                        continue;
                    }

                    // Update totals
                    if ("INCOME".equals(transactionType)) {
                        totalIncome = totalIncome.add(amount);
                        logger.trace("Added income: {}, new total: {}", amount, totalIncome);
                    } else if ("EXPENSE".equals(transactionType)) {
                        totalExpense = totalExpense.add(amount);
                        logger.trace("Added expense: {}, new total: {}", amount, totalExpense);
                    } else {
                        logger.warn("Unknown transaction type: {} for transaction {}", transactionType,
                                transaction.getId());
                    }

                    // Update category breakdown
                    Category category = transaction.getCategory();
                    String categoryName = category != null ? category.getName() : "Uncategorized";
                    logger.trace("Category for transaction: {}", categoryName);

                    categoryBreakdown.computeIfAbsent(categoryName, k -> {
                        logger.trace("Creating new category breakdown for: {}", k);
                        return new HashMap<String, Object>() {
                            {
                                put("category", k);
                                put("totalAmount", BigDecimal.ZERO);
                                put("transactionCount", 0);
                                put("expenses", BigDecimal.ZERO);
                                put("income", BigDecimal.ZERO);
                            }
                        };
                    });

                    Map<String, Object> categoryData = categoryBreakdown.get(categoryName);
                    categoryData.compute("totalAmount", (k, v) -> {
                        BigDecimal newAmount = ((BigDecimal) v).add(amount);
                        logger.trace("Updated category {} totalAmount: {} -> {}", categoryName, v, newAmount);
                        return newAmount;
                    });
                    categoryData.compute("transactionCount", (k, v) -> {
                        int newCount = ((Integer) v) + 1;
                        logger.trace("Updated category {} transactionCount: {} -> {}", categoryName, v, newCount);
                        return newCount;
                    });

                    if ("INCOME".equals(transactionType)) {
                        categoryData.compute("income", (k, v) -> {
                            BigDecimal newIncome = ((BigDecimal) v).add(amount);
                            logger.trace("Updated category {} income: {} -> {}", categoryName, v, newIncome);
                            return newIncome;
                        });
                    } else {
                        categoryData.compute("expenses", (k, v) -> {
                            BigDecimal newExpenses = ((BigDecimal) v).add(amount);
                            logger.trace("Updated category {} expenses: {} -> {}", categoryName, v, newExpenses);
                            return newExpenses;
                        });
                    }

                    // Update account summary
                    Account account = transaction.getAccount();
                    if (account == null) {
                        logger.warn("Transaction {} has null account, skipping account summary update",
                                transaction.getId());
                        continue;
                    }
                    String accountName = account.getName();
                    logger.trace("Account for transaction: {}", accountName);

                    accountSummary.computeIfAbsent(accountName, k -> {
                        logger.trace("Creating new account summary for: {}", k);
                        return new HashMap<String, Object>() {
                            {
                                put("account", k);
                                put("balance", BigDecimal.ZERO);
                                put("transactionCount", 0);
                                put("lastTransaction", null);
                                put("income", BigDecimal.ZERO);
                                put("expenses", BigDecimal.ZERO);
                            }
                        };
                    });

                    Map<String, Object> accountData = accountSummary.get(accountName);
                    accountData.compute("transactionCount", (k, v) -> {
                        int newCount = ((Integer) v) + 1;
                        logger.trace("Updated account {} transactionCount: {} -> {}", accountName, v, newCount);
                        return newCount;
                    });
                    accountData.put("lastTransaction", transaction.getDate());

                    if ("INCOME".equals(transactionType)) {
                        accountData.compute("income", (k, v) -> {
                            BigDecimal newIncome = ((BigDecimal) v).add(amount);
                            logger.trace("Updated account {} income: {} -> {}", accountName, v, newIncome);
                            return newIncome;
                        });
                        accountData.compute("balance", (k, v) -> {
                            BigDecimal newBalance = ((BigDecimal) v).add(amount);
                            logger.trace("Updated account {} balance: {} -> {}", accountName, v, newBalance);
                            return newBalance;
                        });
                    } else {
                        accountData.compute("expenses", (k, v) -> {
                            BigDecimal newExpenses = ((BigDecimal) v).add(amount);
                            logger.trace("Updated account {} expenses: {} -> {}", accountName, v, newExpenses);
                            return newExpenses;
                        });
                        accountData.compute("balance", (k, v) -> {
                            BigDecimal newBalance = ((BigDecimal) v).subtract(amount);
                            logger.trace("Updated account {} balance: {} -> {}", accountName, v, newBalance);
                            return newBalance;
                        });
                    }
                } catch (Exception e) {
                    logger.error("Error processing transaction {}: {}",
                            transaction != null ? transaction.getId() : "null",
                            e.getMessage(), e);
                    // Continue processing other transactions
                }
            }

            // Build response
            logger.debug("Building response with {} categories and {} accounts",
                    categoryBreakdown.size(), accountSummary.size());
            try {
                response.put("userId", userId);
                response.put("startDate", startDate);
                response.put("endDate", endDate);
                response.put("totalIncome", totalIncome);
                response.put("totalExpense", totalExpense);
                response.put("netBalance", totalIncome.subtract(totalExpense));
                response.put("categoryBreakdown", new ArrayList<>(categoryBreakdown.values()));
                response.put("accountSummary", new ArrayList<>(accountSummary.values()));
                response.put("transactionCount", transactions.size());
                response.put("generatedAt", LocalDateTime.now());
                response.put("status", "SUCCESS");
            } catch (Exception e) {
                logger.error("Error building response: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to build response: " + e.getMessage(), e);
            }

            logger.info("Successfully generated report for user {} with {} transactions", userId, transactions.size());
            return response;

        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found while generating report: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid input parameters: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error generating report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate report: " + e.getMessage(), e);
        }
    }

    public List<Map<String, Object>> getFilteredReports(Long userId, LocalDate startDate, LocalDate endDate,
            String type) {
        logger.info("Getting filtered reports for user {} with type {}", userId, type);

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetweenAndType(
                userId, startDate, endDate, type);

        return transactions.stream()
                .map(this::transformTransactionToReport)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getCategorySummary(Long userId, LocalDate startDate, LocalDate endDate) {
        logger.info("Getting category summary for user {}", userId);

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Map<String, Object>> categoryBreakdown = transactionRepository.getCategoryWiseBreakdown(
                userId, startDate, endDate);

        Map<String, Object> summary = new HashMap<>();
        summary.put("categoryBreakdown", categoryBreakdown);
        summary.put("startDate", startDate);
        summary.put("endDate", endDate);

        return summary;
    }

    public Map<String, Object> getAccountsSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        logger.info("Getting accounts summary for user {}", userId);

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Map<String, Object>> accountBalances = accountRepository.getAccountBalances(userId);
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(
                userId, startDate, endDate);
        List<Map<String, Object>> recentTransactions = transactions.stream()
                .map(this::transformTransactionToReport)
                .collect(Collectors.toList());

        Map<String, Object> summary = new HashMap<>();
        summary.put("accounts", accountBalances);
        summary.put("recentTransactions", recentTransactions);
        summary.put("totalBalance", calculateTotalBalance(accountBalances));

        return summary;
    }

    private Map<String, Object> transformTransactionToReport(Transaction transaction) {
        Map<String, Object> report = new HashMap<>();
        report.put("id", transaction.getId());
        report.put("date", transaction.getDate());
        report.put("type", transaction.getType());
        report.put("amount", transaction.getAmount());
        report.put("description", transaction.getDescription() != null ? transaction.getDescription() : "");
        report.put("accountName",
                transaction.getAccount() != null ? transaction.getAccount().getName() : "Default Account");
        report.put("categoryName",
                transaction.getCategory() != null ? transaction.getCategory().getName() : "Uncategorized");
        if (transaction.getSubcategory() != null) {
            report.put("subcategoryName", transaction.getSubcategory().getName());
        }
        return report;
    }

    private BigDecimal calculateTotalBalance(List<Map<String, Object>> accountBalances) {
        return accountBalances.stream()
                .map(account -> (BigDecimal) account.get("balance"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
