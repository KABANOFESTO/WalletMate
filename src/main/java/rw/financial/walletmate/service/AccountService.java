package rw.financial.walletmate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rw.financial.walletmate.dto.AccountConverter;
import rw.financial.walletmate.dto.AccountDto;
import rw.financial.walletmate.exception.ResourceNotFoundException;
import rw.financial.walletmate.model.Account;
import rw.financial.walletmate.model.User;
import rw.financial.walletmate.repository.AccountRepository;
import rw.financial.walletmate.security.SecurityUtils;

import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final AccountConverter accountConverter;
    private final SecurityUtils securityUtils;

    @Transactional
    public AccountDto createAccount(AccountDto accountDto) {
        // Get the authenticated user
        User currentUser = securityUtils.getCurrentUser();

        Account account = accountConverter.convertToEntity(accountDto);
        account.setUser(currentUser);
        account.setCreatedAt(LocalDateTime.now());
        account.setBalance(BigDecimal.ZERO);

        Account savedAccount = accountRepository.save(account);
        return accountConverter.convertToDto(savedAccount);
    }

    public List<AccountDto> getAccountsByUser() {
        User currentUser = securityUtils.getCurrentUser();
        return accountRepository.findByUserId(currentUser.getId())
                .stream()
                .map(accountConverter::convertToDto)
                .collect(Collectors.toList());
    }

    // Add this method to fetch accounts for a specific user by userId
    public List<AccountDto> getAccountsByUser(Long userId) {
        return accountRepository.findByUserId(userId)
                .stream()
                .map(accountConverter::convertToDto)
                .collect(Collectors.toList());
    }

    public AccountDto getAccountById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        return accountRepository.findByIdAndUserId(id, currentUser.getId())
                .map(accountConverter::convertToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
    }

    @Transactional
    public AccountDto updateAccount(Long id, AccountDto accountDto) {
        User currentUser = securityUtils.getCurrentUser();
        
        Account account = accountRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));

        accountConverter.updateEntityFromDto(accountDto, account);
        account.setUpdatedAt(LocalDateTime.now());

        Account updatedAccount = accountRepository.save(account);
        return accountConverter.convertToDto(updatedAccount);
    }

    @Transactional
    public void deleteAccount(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        
        Account account = accountRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));

        accountRepository.delete(account);
    }
}
