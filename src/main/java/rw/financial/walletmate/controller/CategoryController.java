package rw.financial.walletmate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rw.financial.walletmate.dto.CategoryDto;
import rw.financial.walletmate.dto.SubcategoryDto;
import rw.financial.walletmate.model.Category;
import rw.financial.walletmate.service.CategoryService;
import rw.financial.walletmate.service.SubcategoryService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private SubcategoryService subcategoryService;

    // Create a new category
    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(categoryService.createCategory(categoryDto));
    }

    // Create a new subcategory
    @PostMapping("/{categoryId}/subcategories")
    public ResponseEntity<SubcategoryDto> createSubcategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody SubcategoryDto subcategoryDto) {
        return ResponseEntity.ok(subcategoryService.createSubcategory(categoryId, subcategoryDto));
    }

    // Get all categories for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CategoryDto>> getUserCategories(@PathVariable Long userId) {
        return ResponseEntity.ok(categoryService.getUserCategories(userId));
    }

    // Get all subcategories for a category
    @GetMapping("/{categoryId}/subcategories")
    public ResponseEntity<List<SubcategoryDto>> getCategorySubcategories(@PathVariable Long categoryId) {
        return ResponseEntity.ok(subcategoryService.getCategorySubcategories(categoryId));
    }

    // Get a single category by ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update a category
    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(categoryService.updateCategory(categoryId, categoryDto));
    }

    // Delete a category
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    // Delete a subcategory
    @DeleteMapping("/subcategories/{subcategoryId}")
    public ResponseEntity<Void> deleteSubcategory(@PathVariable Long subcategoryId) {
        subcategoryService.deleteSubcategory(subcategoryId);
        return ResponseEntity.noContent().build();
    }
}
