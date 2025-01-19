package rw.financial.walletmate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rw.financial.walletmate.model.Account;
import rw.financial.walletmate.model.AccountType;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
    Optional<Account> findByIdAndUserId(Long id, Long userId);
    Optional<Account> findByTypeAndUserId(AccountType type, Long userId);
    
    @Query("SELECT new map(" +
           "a.id as accountId, " +
           "a.name as accountName, " +
           "a.type as accountType, " +
           "COALESCE(a.balance, 0) as balance, " +
           "COALESCE((SELECT SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END) " +
           "         FROM Transaction t WHERE t.account = a AND t.user.id = :userId), 0) as totalIncome, " +
           "COALESCE((SELECT SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END) " +
           "         FROM Transaction t WHERE t.account = a AND t.user.id = :userId), 0) as totalExpense, " +
           "COUNT(DISTINCT t.id) as transactionCount) " +
           "FROM Account a " +
           "LEFT JOIN Transaction t ON t.account = a " +
           "WHERE a.user.id = :userId " +
           "GROUP BY a.id, a.name, a.type, a.balance")
    List<Map<String, Object>> getAccountBalances(@Param("userId") Long userId);

    @Query("SELECT COUNT(a) > 0 FROM Account a WHERE a.user.id = :userId")
    boolean hasAnyAccounts(@Param("userId") Long userId);
    
    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.type = 'CASH' ORDER BY a.id LIMIT 1")
    Optional<Account> findDefaultAccount(@Param("userId") Long userId);
}
