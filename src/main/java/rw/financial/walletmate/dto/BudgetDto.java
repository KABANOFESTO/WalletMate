package rw.financial.walletmate.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDto {
    private Long id;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private Long subcategoryId;
    
    @NotNull(message = "Budget limit is required")
    @Positive(message = "Budget limit must be greater than zero")
    private BigDecimal limit;
    
    private BigDecimal currentSpent;
    
    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    @FutureOrPresent(message = "End date must be today or in the future")
    private LocalDate endDate;
    
    private String categoryName;
    private String subcategoryName;
    private BigDecimal remainingAmount;
    private Double spentPercentage;

    @Override
    public String toString() {
        return "BudgetDto{" +
                "id=" + id +
                ", userId=" + userId +
                ", categoryId=" + categoryId +
                ", subcategoryId=" + subcategoryId +
                ", limit=" + limit +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                '}';
    }
}
