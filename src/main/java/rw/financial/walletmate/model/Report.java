package rw.financial.walletmate.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_income", precision = 19, scale = 2)
    private BigDecimal totalIncome = BigDecimal.ZERO;

    @Column(name = "total_expense", precision = 19, scale = 2)
    private BigDecimal totalExpense = BigDecimal.ZERO;

    @NotNull(message = "Generated date is required")
    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        this.generatedAt = LocalDateTime.now();
        if (this.totalIncome == null) {
            this.totalIncome = BigDecimal.ZERO;
        }
        if (this.totalExpense == null) {
            this.totalExpense = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.totalIncome == null) {
            this.totalIncome = BigDecimal.ZERO;
        }
        if (this.totalExpense == null) {
            this.totalExpense = BigDecimal.ZERO;
        }
    }
}