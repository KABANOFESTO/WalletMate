package rw.financial.walletmate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rw.financial.walletmate.dto.AccountDto; // Import AccountDto
import rw.financial.walletmate.service.AccountService;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    // Create a new account
    @PostMapping
    public ResponseEntity<AccountDto> createAccount(@RequestBody AccountDto accountDto) {
        AccountDto createdAccount = accountService.createAccount(accountDto);
        return ResponseEntity.ok(createdAccount);
    }

    // Fetch all accounts for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AccountDto>> getAccountsByUser(@PathVariable Long userId) {
        List<AccountDto> accounts = accountService.getAccountsByUser(userId);
        return ResponseEntity.ok(accounts);
    }

    // Fetch a specific account by ID
    @GetMapping("/{id}")
    public ResponseEntity<AccountDto> getAccountById(@PathVariable Long id) {
        AccountDto account = accountService.getAccountById(id);
        if (account != null) {
            return ResponseEntity.ok(account);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Update an account
    @PutMapping("/{id}")
    public ResponseEntity<AccountDto> updateAccount(@PathVariable Long id, @RequestBody AccountDto accountDto) {
        AccountDto updatedAccount = accountService.updateAccount(id, accountDto);
        return ResponseEntity.ok(updatedAccount);
    }

    // Delete an account
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}
