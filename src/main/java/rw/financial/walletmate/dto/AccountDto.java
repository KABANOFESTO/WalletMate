package rw.financial.walletmate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import rw.financial.walletmate.model.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDto {
    private Long id;
    private String userName;
    private String name;
    private AccountType type;
    private String accountTypeDisplay; // Added to store the display name
    private BigDecimal balance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}