package rw.financial.walletmate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rw.financial.walletmate.dto.BudgetDto;
import rw.financial.walletmate.exception.ResourceNotFoundException;
import rw.financial.walletmate.model.Budget;
import rw.financial.walletmate.service.BudgetService;

import jakarta.validation.Valid;
import java.util.Collections;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindingResult;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
@Slf4j
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    // Create a new budget
    @PostMapping
    public ResponseEntity<?> createBudget(@Valid @RequestBody BudgetDto budgetDto, BindingResult bindingResult) {
        try {
            log.debug("Received request to create budget: {}", budgetDto);
            
            // Check for validation errors
            if (bindingResult.hasErrors()) {
                List<String> errors = bindingResult.getAllErrors().stream()
                    .map(DefaultMessageSourceResolvable::getDefaultMessage)
                    .collect(Collectors.toList());
                return ResponseEntity.badRequest().body(errors);
            }

            // Additional validation
            if (budgetDto.getStartDate().isAfter(budgetDto.getEndDate())) {
                return ResponseEntity.badRequest().body("Start date cannot be after end date");
            }

            BudgetDto createdBudget = budgetService.createBudget(budgetDto);
            log.debug("Successfully created budget with ID: {}", createdBudget.getId());
            return ResponseEntity.ok(createdBudget);
            
        } catch (ResourceNotFoundException e) {
            log.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
        } catch (Exception e) {
            log.error("Error creating budget: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while creating the budget: " + e.getMessage());
        }
    }

    // Get all budgets for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BudgetDto>> getUserBudgets(@PathVariable Long userId) {
        try {
            List<BudgetDto> budgets = budgetService.getUserBudgets(userId);
            return ResponseEntity.ok(budgets);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get budgets for a category for a user
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<BudgetDto> getCategoryBudget(
            @PathVariable Long categoryId,
            @RequestParam Long userId) {
        try {
            BudgetDto budget = budgetService.getCategoryBudget(userId, categoryId);
            return ResponseEntity.ok(budget);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get a single budget by ID
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        try {
            return budgetService.getBudgetById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Update a budget
    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetDto> updateBudget(
            @PathVariable Long budgetId,
            @Valid @RequestBody BudgetDto budgetDto) {
        try {
            BudgetDto updatedBudget = budgetService.updateBudget(budgetId, budgetDto);
            return ResponseEntity.ok(updatedBudget);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get budgets for a subcategory for a user
    @GetMapping("/user/{userId}/subcategory/{subcategoryId}")
    public ResponseEntity<List<Budget>> getBudgetsByUserAndSubcategory(
            @PathVariable Long userId,
            @PathVariable Long subcategoryId) {
        try {
            List<Budget> budgets = budgetService.getBudgetsByUserAndSubcategory(userId, subcategoryId);
            return ResponseEntity.ok(budgets);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get budgets for a category for a user
    @GetMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<List<BudgetDto>> getBudgetsByUserAndCategory(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        try {
            BudgetDto budget = budgetService.getCategoryBudget(userId, categoryId);
            return ResponseEntity.ok(Collections.singletonList(budget));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete a budget
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        try {
            budgetService.deleteBudget(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get budget status
    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getBudgetStatus(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(budgetService.getBudgetStatus(userId));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
