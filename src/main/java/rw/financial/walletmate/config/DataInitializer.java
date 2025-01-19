package rw.financial.walletmate.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import rw.financial.walletmate.model.*;
import rw.financial.walletmate.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            // Create test user if not exists
            String testEmail = "kabanofesto@gmail.com";
            if (!userRepository.findByEmail(testEmail).isPresent()) {
                logger.info("Creating test user");
                User user = new User();
                user.setName("Test User");
                user.setEmail(testEmail);
                user.setPassword(passwordEncoder.encode("password"));
                user.setRole(Role.USER);
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
                user = userRepository.save(user);

                // Create test account
                logger.info("Creating test account");
                Account account = new Account();
                account.setUser(user);
                account.setName("Test Account");
                account.setType(AccountType.SAVINGS);
                account.setBalance(BigDecimal.valueOf(1000));
                account.setCreatedAt(LocalDateTime.now());
                account.setUpdatedAt(LocalDateTime.now());
                accountRepository.save(account);

                // Create test categories
                logger.info("Creating test categories");
                createCategory(user, "Food", "Food and dining expenses");
                createCategory(user, "Transportation", "Transportation expenses");
                createCategory(user, "Entertainment", "Entertainment expenses");
                createCategory(user, "Utilities", "Utility bills");
                createCategory(user, "Salary", "Monthly salary");
            }
            logger.info("Data initialization completed successfully");
        } catch (Exception e) {
            logger.error("Error initializing data: {}", e.getMessage(), e);
        }
    }

    private void createCategory(User user, String name, String description) {
        Category category = new Category();
        category.setUser(user);
        category.setName(name);
        category.setDescription(description);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        categoryRepository.save(category);
    }
}
