package rw.financial.walletmate.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rw.financial.walletmate.dto.SubcategoryDto;
import rw.financial.walletmate.exception.ResourceNotFoundException;
import rw.financial.walletmate.model.Subcategory;
import rw.financial.walletmate.service.SubcategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
public class SubcategoryController {
    private static final Logger logger = LoggerFactory.getLogger(SubcategoryController.class);

    @Autowired
    private SubcategoryService subcategoryService;

    // Create a new subcategory
    @PostMapping("/category/{categoryId}")
    public ResponseEntity<SubcategoryDto> createSubcategory(
            @PathVariable Long categoryId,
            @RequestBody SubcategoryDto subcategoryDto) {
        try {
            logger.debug("Creating new subcategory for category {}", categoryId);
            SubcategoryDto createdSubcategory = subcategoryService.createSubcategory(categoryId, subcategoryDto);
            logger.debug("Subcategory created successfully");
            return ResponseEntity.ok(createdSubcategory);
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error creating subcategory: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get all subcategories for a user and category
    @GetMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<List<SubcategoryDto>> getSubcategoriesByUserAndCategory(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        try {
            logger.debug("Fetching subcategories for user {} and category {}", userId, categoryId);
            List<SubcategoryDto> subcategories = subcategoryService.getSubcategoriesByUserAndCategory(userId, categoryId);
            logger.debug("Found {} subcategories", subcategories.size());
            return ResponseEntity.ok(subcategories);
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error fetching subcategories: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get a single subcategory by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubcategoryById(@PathVariable Long id) {
        try {
            logger.debug("Fetching subcategory by ID {}", id);
            return subcategoryService.getSubcategoryById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching subcategory: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while fetching subcategory: " + e.getMessage());
        }
    }

    // Update a subcategory
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubcategory(@PathVariable Long id, @RequestBody Subcategory subcategory) {
        try {
            logger.debug("Updating subcategory with ID {}", id);
            Subcategory updatedSubcategory = subcategoryService.updateSubcategory(id, subcategory);
            logger.debug("Subcategory updated successfully");
            return ResponseEntity.ok(updatedSubcategory);
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating subcategory: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while updating subcategory: " + e.getMessage());
        }
    }

    // Delete a subcategory
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubcategory(@PathVariable Long id) {
        try {
            logger.debug("Deleting subcategory with ID {}", id);
            subcategoryService.deleteSubcategory(id);
            logger.debug("Subcategory deleted successfully");
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error deleting subcategory: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while deleting subcategory: " + e.getMessage());
        }
    }
}
