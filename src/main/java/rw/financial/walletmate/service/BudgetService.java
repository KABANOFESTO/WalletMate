package rw.financial.walletmate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.financial.walletmate.dto.BudgetDto;
import rw.financial.walletmate.model.*;
import rw.financial.walletmate.repository.*;
import rw.financial.walletmate.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private static final Logger logger = LoggerFactory.getLogger(BudgetService.class);

    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private SubcategoryRepository subcategoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public BudgetDto createBudget(BudgetDto dto) {
        try {
            logger.debug("Creating budget with DTO: {}", dto);
            
            // First verify the user exists
            User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));
            logger.debug("Found user: {}", user.getId());
            
            // Find and verify category
            logger.debug("Finding category with ID: {}", dto.getCategoryId());
            Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));
            logger.debug("Found category: {}", category.getId());
                
            // Verify that the category belongs to the user
            if (!category.getUser().getId().equals(dto.getUserId())) {
                logger.error("Category {} belongs to user {} but was requested by user {}", 
                    dto.getCategoryId(), category.getUser().getId(), dto.getUserId());
                throw new ResourceNotFoundException("Category does not belong to the specified user");
            }
            
            Budget budget = new Budget();
            budget.setUser(user);
            budget.setCategory(category);
            budget.setLimit(dto.getLimit());
            budget.setStartDate(dto.getStartDate());
            budget.setEndDate(dto.getEndDate());
            
            if (dto.getSubcategoryId() != null) {
                logger.debug("Finding subcategory with ID: {}", dto.getSubcategoryId());
                Subcategory subcategory = subcategoryRepository.findById(dto.getSubcategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found with id: " + dto.getSubcategoryId()));
                logger.debug("Found subcategory: {}", subcategory.getId());
                    
                // Verify that the subcategory belongs to the category
                if (!subcategory.getCategory().getId().equals(dto.getCategoryId())) {
                    logger.error("Subcategory {} belongs to category {} but was requested for category {}", 
                        dto.getSubcategoryId(), subcategory.getCategory().getId(), dto.getCategoryId());
                    throw new ResourceNotFoundException("Subcategory does not belong to the specified category");
                }
                
                budget.setSubcategory(subcategory);
            }
            
            logger.debug("Saving budget entity: {}", budget);
            budget = budgetRepository.save(budget);
            logger.debug("Successfully saved budget with ID: {}", budget.getId());
            
            BudgetDto resultDto = mapToDto(budget);
            logger.debug("Mapped to DTO: {}", resultDto);
            return resultDto;
            
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found while creating budget: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error creating budget: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating budget: " + e.getMessage(), e);
        }
    }

    public List<BudgetDto> getUserBudgets(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        if (budgets.isEmpty()) {
            throw new ResourceNotFoundException("No budgets found for user");
        }
        return budgets.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public BudgetDto getCategoryBudget(Long userId, Long categoryId) {
        List<Budget> budgets = budgetRepository.findByUserIdAndCategoryId(userId, categoryId);
        if (budgets.isEmpty()) {
            throw new ResourceNotFoundException("Budget not found");
        }
        return mapToDto(budgets.get(0));
    }

    @Transactional
    public BudgetDto updateBudget(Long budgetId, BudgetDto dto) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        
        budget.setLimit(dto.getLimit());
        budget.setStartDate(dto.getStartDate());
        budget.setEndDate(dto.getEndDate());
        
        budget = budgetRepository.save(budget);
        return mapToDto(budget);
    }

    public void checkBudgetLimits(Transaction transaction) {
        List<Budget> budgets = budgetRepository.findActiveBudgetsByCategory(
            transaction.getCategory().getId(),
            transaction.getDate()
        );
        
        for (Budget budget : budgets) {
            BigDecimal totalSpent = calculateTotalSpent(budget);
            
            if (totalSpent.compareTo(budget.getLimit()) > 0) {
                String message = String.format(
                    "Budget alert: You have exceeded your budget limit of %s for category '%s'",
                    budget.getLimit(),
                    budget.getCategory().getName()
                );
                User user = transaction.getAccount().getUser();
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setMessage(message);
                notificationService.createNotification(notification);
            } else if (totalSpent.multiply(BigDecimal.valueOf(0.9)).compareTo(budget.getLimit()) > 0) {
                String message = String.format(
                    "Budget warning: You have used 90%% of your budget limit for category '%s'",
                    budget.getCategory().getName()
                );
                User user = transaction.getAccount().getUser();
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setMessage(message);
                notificationService.createNotification(notification);
            }
        }
    }

    public Map<String, Object> getBudgetStatus(Long userId) {
        List<Budget> activeBudgets = budgetRepository.findActiveByUserId(userId, LocalDate.now());
        
        return Map.of(
            "budgets", activeBudgets.stream()
                .map(budget -> Map.of(
                    "category", budget.getCategory().getName(),
                    "limit", budget.getLimit(),
                    "spent", calculateTotalSpent(budget),
                    "remaining", budget.getLimit().subtract(calculateTotalSpent(budget)),
                    "percentage", calculateSpentPercentage(budget)
                ))
                .collect(Collectors.toList())
        );
    }

    @Transactional(readOnly = true)
    public java.util.Optional<Budget> getBudgetById(Long id) {
        return budgetRepository.findById(id);
    }

    public List<Budget> getBudgetsByUserAndSubcategory(Long userId, Long subcategoryId) {
        List<Budget> budgets = budgetRepository.findByUserIdAndSubcategoryId(userId, subcategoryId);
        if (budgets.isEmpty()) {
            throw new ResourceNotFoundException("No budgets found for user and subcategory");
        }
        return budgets;
    }

    @Transactional
    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        budgetRepository.delete(budget);
    }

    private BigDecimal calculateTotalSpent(Budget budget) {
        return transactionRepository.sumExpensesByBudget(
            budget.getCategory().getId(),
            budget.getSubcategory() != null ? budget.getSubcategory().getId() : null,
            budget.getStartDate(),
            budget.getEndDate()
        );
    }

    private Double calculateSpentPercentage(Budget budget) {
        BigDecimal totalSpent = calculateTotalSpent(budget);
        return totalSpent.divide(budget.getLimit(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private BudgetDto mapToDto(Budget budget) {
        BudgetDto dto = new BudgetDto();
        dto.setId(budget.getId());
        dto.setLimit(budget.getLimit());
        dto.setStartDate(budget.getStartDate());
        dto.setEndDate(budget.getEndDate());
        dto.setCategoryId(budget.getCategory().getId());
        dto.setCategoryName(budget.getCategory().getName());
        
        if (budget.getSubcategory() != null) {
            dto.setSubcategoryId(budget.getSubcategory().getId());
            dto.setSubcategoryName(budget.getSubcategory().getName());
        }
        
        dto.setUserId(budget.getUser().getId());
        
        // Calculate current spent amount
        BigDecimal currentSpent = calculateTotalSpent(budget);
        dto.setCurrentSpent(currentSpent);
        
        // Calculate remaining amount
        BigDecimal remainingAmount = budget.getLimit().subtract(currentSpent);
        dto.setRemainingAmount(remainingAmount);
        
        // Calculate spent percentage
        dto.setSpentPercentage(calculateSpentPercentage(budget));
        
        return dto;
    }
}
