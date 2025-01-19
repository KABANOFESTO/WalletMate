package rw.financial.walletmate.dto;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import rw.financial.walletmate.model.Account;
import rw.financial.walletmate.model.AccountType;

@Component
@RequiredArgsConstructor
public class AccountConverter {

    public AccountDto convertToDto(Account account) {
        if (account == null) {
            return null;
        }

        return AccountDto.builder()
                .id(account.getId())
                .userName(account.getUser() != null ? account.getUser().getName() : null)
                .name(account.getName())
                .type(account.getType())
                .accountTypeDisplay(account.getType() != null ? account.getType().getDisplayName() : null)
                .balance(account.getBalance())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    public Account convertToEntity(AccountDto dto) {
        if (dto == null) {
            return null;
        }

        Account account = new Account();
        updateEntityFromDto(dto, account);
        return account;
    }

    public void updateEntityFromDto(AccountDto dto, Account account) {
        if (dto == null || account == null) {
            return;
        }
        
        account.setName(dto.getName());
        account.setType(dto.getType());
        account.setBalance(dto.getBalance());
        // Don't update user from DTO for security reasons
        // Don't update timestamps as they're managed by JPA
    }

    /**
     * Helper method to safely convert a display name to AccountType
     */
    public AccountType getAccountTypeFromDisplayName(String displayName) {
        if (displayName == null) {
            return null;
        }
        return AccountType.fromDisplayName(displayName);
    }
}