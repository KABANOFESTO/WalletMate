package rw.financial.walletmate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rw.financial.walletmate.model.Budget;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);

    List<Budget> findByUserIdAndCategoryId(Long userId, Long categoryId);

    List<Budget> findByUserIdAndSubcategoryId(Long userId, Long subcategoryId);
    
    @Query("SELECT b FROM Budget b WHERE b.category.id = :categoryId AND b.startDate <= :date AND b.endDate >= :date")
    List<Budget> findActiveBudgetsByCategory(@Param("categoryId") Long categoryId, @Param("date") LocalDate date);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.startDate <= :date AND b.endDate >= :date")
    List<Budget> findActiveByUserId(@Param("userId") Long userId, @Param("date") LocalDate date);
}
