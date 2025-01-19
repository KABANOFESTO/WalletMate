package rw.financial.walletmate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import rw.financial.walletmate.model.Category;
import rw.financial.walletmate.model.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Existing methods with date field standardization
    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByAccountId(Long accountId);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.account " +
           "LEFT JOIN FETCH t.category " +
           "LEFT JOIN FETCH t.subcategory " +
           "WHERE t.account.id = :accountId " +
           "AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByAccountIdAndDateBetween(
            @Param("accountId") Long accountId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.account " +
           "LEFT JOIN FETCH t.category " +
           "LEFT JOIN FETCH t.subcategory " +
           "WHERE t.user.id = :userId " +
           "AND t.category.id = :categoryId " +
           "AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndCategoryIdAndDateBetween(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT DISTINCT t FROM Transaction t " +
           "LEFT JOIN FETCH t.account a " +
           "LEFT JOIN FETCH t.category c " +
           "LEFT JOIN FETCH t.subcategory s " +
           "LEFT JOIN FETCH t.user u " +
           "WHERE t.user.id = :userId " +
           "AND t.date BETWEEN :startDate AND :endDate " +
           "ORDER BY t.date DESC")
    List<Transaction> findByDateBetweenAndUserId(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.account " +
           "LEFT JOIN FETCH t.category " +
           "LEFT JOIN FETCH t.subcategory " +
           "WHERE t.user.id = :userId " +
           "AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.account " +
           "LEFT JOIN FETCH t.category " +
           "LEFT JOIN FETCH t.subcategory " +
           "WHERE t.user.id = :userId " +
           "AND t.type = :type " +
           "AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndTypeAndDateBetween(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN FETCH t.account " +
           "LEFT JOIN FETCH t.category " +
           "LEFT JOIN FETCH t.subcategory " +
           "WHERE t.user.id = :userId " +
           "AND t.date BETWEEN :startDate AND :endDate " +
           "AND t.type = :type")
    List<Transaction> findByUserIdAndDateBetweenAndType(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") String type);

    @Query("SELECT new map(" +
           "COALESCE(c.name, 'Uncategorized') as category, " +
           "COALESCE(c.description, '') as description, " +
           "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) as totalExpense, " +
           "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) as totalIncome, " +
           "COUNT(t.id) as transactionCount) " +
           "FROM Transaction t " +
           "LEFT JOIN t.category c " +
           "WHERE t.user.id = :userId " +
           "AND t.date BETWEEN :startDate AND :endDate " +
           "AND (c.user.id = :userId OR c.id IS NULL) " +
           "GROUP BY c.id, c.name, c.description")
    List<Map<String, Object>> getCategoryWiseBreakdown(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId " +
           "AND t.type = :type " +
           "AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumTransactionByTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT new map(" +
           "COALESCE(c.name, 'Uncategorized') as category, " +
           "COALESCE(c.id, 0) as categoryId, " +
           "COALESCE(t.type, 'UNKNOWN') as type, " +
           "COUNT(t) as count, " +
           "COALESCE(SUM(t.amount), 0) as total) " +
           "FROM Transaction t " +
           "LEFT JOIN t.category c " +
           "WHERE t.user.id = :userId " +
           "AND t.date BETWEEN :startDate AND :endDate " +
           "GROUP BY c.id, c.name, t.type")
    List<Map<String, Object>> getCategoryWiseDetailedBreakdown(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    boolean existsByCategory(Category category);

    List<Transaction> findByCategoryIdAndDateAfter(Long categoryId, LocalDateTime date);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.category.id = :categoryId " +
           "AND (:subcategoryId IS NULL OR t.subcategory.id = :subcategoryId) " +
           "AND t.type = 'EXPENSE' " +
           "AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesByBudget(
            @Param("categoryId") Long categoryId,
            @Param("subcategoryId") Long subcategoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
