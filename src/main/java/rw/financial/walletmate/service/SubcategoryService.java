package rw.financial.walletmate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.financial.walletmate.exception.ResourceNotFoundException;
import rw.financial.walletmate.model.Subcategory;
import rw.financial.walletmate.model.Category;
import rw.financial.walletmate.dto.SubcategoryDto;
import rw.financial.walletmate.repository.CategoryRepository;
import rw.financial.walletmate.repository.SubcategoryRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SubcategoryService {
    private static final Logger logger = LoggerFactory.getLogger(SubcategoryService.class);

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Create a new subcategory
    @Transactional
    public SubcategoryDto createSubcategory(Long categoryId, SubcategoryDto dto) {
        try {
            logger.debug("Creating new subcategory for category {}", categoryId);
            
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

            logger.debug("Found category: {}", category);
            
            Subcategory subcategory = new Subcategory();
            subcategory.setName(dto.getName());
            subcategory.setDescription(dto.getDescription());
            subcategory.setCategory(category);
            subcategory.setUser(category.getUser());

            // Check for existing subcategory with same name
            Optional<Subcategory> existingSubcategory = subcategoryRepository.findByUserIdAndCategoryIdAndName(
                    category.getUser().getId(),
                    categoryId,
                    dto.getName()
            );
            
            if (existingSubcategory.isPresent()) {
                logger.error("Subcategory with the same name already exists for this user and category");
                throw new ResourceNotFoundException("Subcategory with the same name already exists for this user and category");
            }

            subcategory = subcategoryRepository.save(subcategory);
            logger.debug("Created new subcategory: {}", subcategory);
            
            return mapToDto(subcategory);
            
        } catch (Exception e) {
            logger.error("Error creating new subcategory for category {}: {}", 
                categoryId, e.getMessage(), e);
            throw e;
        }
    }

    private SubcategoryDto mapToDto(Subcategory subcategory) {
        SubcategoryDto dto = new SubcategoryDto();
        dto.setId(subcategory.getId());
        dto.setName(subcategory.getName());
        dto.setDescription(subcategory.getDescription());
        dto.setCategoryId(subcategory.getCategory().getId());
        dto.setUserId(subcategory.getUser().getId());
        return dto;
    }

    // Get all subcategories for a user and category
    public List<SubcategoryDto> getSubcategoriesByUserAndCategory(Long userId, Long categoryId) {
        try {
            logger.debug("Fetching subcategories for user {} and category {}", userId, categoryId);
            
            // First verify that the category exists and belongs to the user
            Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
            
            logger.debug("Found category: {}", category);
            
            if (!category.getUser().getId().equals(userId)) {
                logger.error("Category {} belongs to user {} but was requested by user {}", 
                    categoryId, category.getUser().getId(), userId);
                throw new ResourceNotFoundException("Category does not belong to user with id: " + userId);
            }

            List<Subcategory> subcategories = subcategoryRepository.findByUserIdAndCategoryId(userId, categoryId);
            logger.debug("Found {} subcategories", subcategories.size());
            
            return subcategories.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
            
        } catch (Exception e) {
            logger.error("Error fetching subcategories for user {} and category {}: {}", 
                userId, categoryId, e.getMessage(), e);
            throw e;
        }
    }

    // Get a single subcategory by ID
    public Optional<Subcategory> getSubcategoryById(Long id) {
        try {
            logger.debug("Fetching subcategory by id {}", id);
            
            return subcategoryRepository.findById(id);
            
        } catch (Exception e) {
            logger.error("Error fetching subcategory by id {}: {}", 
                id, e.getMessage(), e);
            throw e;
        }
    }

    // Get all subcategories for a category
    public List<SubcategoryDto> getCategorySubcategories(Long categoryId) {
        try {
            logger.debug("Fetching subcategories for category {}", categoryId);
            
            List<Subcategory> subcategories = subcategoryRepository.findByCategoryId(categoryId);
            logger.debug("Found {} subcategories", subcategories.size());
            
            return subcategories.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            logger.error("Error fetching subcategories for category {}: {}", 
                categoryId, e.getMessage(), e);
            throw e;
        }
    }

    // Update a subcategory
    public Subcategory updateSubcategory(Long id, Subcategory updatedSubcategory) {
        try {
            logger.debug("Updating subcategory with id {}", id);
            
            return subcategoryRepository.findById(id).map(subcategory -> {
                subcategory.setName(updatedSubcategory.getName());
                logger.debug("Updated subcategory: {}", subcategory);
                return subcategoryRepository.save(subcategory);
            }).orElseThrow(() -> new ResourceNotFoundException("Subcategory not found"));
            
        } catch (Exception e) {
            logger.error("Error updating subcategory with id {}: {}", 
                id, e.getMessage(), e);
            throw e;
        }
    }

    // Delete a subcategory
    public void deleteSubcategory(Long id) {
        try {
            logger.debug("Deleting subcategory with id {}", id);
            
            subcategoryRepository.deleteById(id);
            logger.debug("Deleted subcategory with id {}", id);
            
        } catch (Exception e) {
            logger.error("Error deleting subcategory with id {}: {}", 
                id, e.getMessage(), e);
            throw e;
        }
    }
}
