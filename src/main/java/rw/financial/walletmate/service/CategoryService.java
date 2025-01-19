package rw.financial.walletmate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.financial.walletmate.dto.CategoryDto;
import rw.financial.walletmate.model.Category;
import rw.financial.walletmate.model.Transaction;
import rw.financial.walletmate.model.User;
import rw.financial.walletmate.repository.CategoryRepository;
import rw.financial.walletmate.repository.TransactionRepository;
import rw.financial.walletmate.repository.UserRepository;
import rw.financial.walletmate.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        User user = userRepository.findById(dto.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setUser(user);
        
        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    public List<CategoryDto> getUserCategories(Long userId) {
        // First check if user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            
        List<Category> categories = categoryRepository.findByUserId(userId);
        LocalDate monthAgo = LocalDate.now().minusMonths(1);
        
        return categories.stream()
                .map(category -> {
                    CategoryDto dto = mapToDto(category);
                    
                    // Get transaction statistics for the past month
                    List<Transaction> transactions = transactionRepository.findByUserIdAndCategoryIdAndDateBetween(
                        userId,
                        category.getId(),
                        monthAgo,
                        LocalDate.now()
                    );
                    
                    dto.setTransactionCount((long) transactions.size());
                    dto.setTotalSpent(transactions.stream()
                        .map(Transaction::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .doubleValue());
                        
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public java.util.Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    @Transactional
    public CategoryDto updateCategory(Long categoryId, CategoryDto dto) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        
        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            
        // Check if category has transactions
        if (transactionRepository.existsByCategory(category)) {
            throw new IllegalStateException("Cannot delete category with existing transactions");
        }
        
        categoryRepository.delete(category);
    }

    private CategoryDto mapToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setUserId(category.getUser().getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        
        return dto;
    }
}
