package rw.financial.walletmate.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionDto {
    private Long id;
    private Long userId;
    private Long accountId;
    private String type; // "INCOME" or "EXPENSE"
    private BigDecimal amount;
    private Long categoryId;
    private Long subcategoryId;
    private String description;
    private LocalDate date;
    private String accountName; // For display purposes
    private String categoryName; // For display purposes
    private String subcategoryName; // For display purposes
}
