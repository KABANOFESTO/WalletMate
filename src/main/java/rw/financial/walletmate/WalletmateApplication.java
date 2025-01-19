package rw.financial.walletmate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EntityScan(basePackages = { "rw.financial.walletmate.model" })
@EnableJpaRepositories(basePackages = { "rw.financial.walletmate.repository" })
public class WalletmateApplication {

    public static void main(String[] args) {
        try {
            // Try to load .env file but don't fail if it's missing
            Dotenv dotenv = Dotenv.configure()
                                .ignoreIfMissing()
                                .load();
            
            // Only set properties from .env if they're not already set in the environment
            setPropertyIfNotExists("DB_URL", dotenv);
            setPropertyIfNotExists("DB_USERNAME", dotenv);
            setPropertyIfNotExists("DB_PASSWORD", dotenv);
            setPropertyIfNotExists("spring.mail.port", "SPRING_MAIL_PORT", dotenv);
            setPropertyIfNotExists("spring.mail.username", "SPRING_MAIL_USERNAME", dotenv);
            setPropertyIfNotExists("spring.mail.password", "SPRING_MAIL_PASSWORD", dotenv);
            
        } catch (Exception e) {
            System.out.println("No .env file found, using environment variables");
        }
        
        SpringApplication.run(WalletmateApplication.class, args);
    }

    private static void setPropertyIfNotExists(String propertyName, Dotenv dotenv) {
        if (System.getProperty(propertyName) == null && System.getenv(propertyName) == null) {
            String value = dotenv.get(propertyName);
            if (value != null) {
                System.setProperty(propertyName, value);
            }
        }
    }

    private static void setPropertyIfNotExists(String propertyName, String envName, Dotenv dotenv) {
        if (System.getProperty(propertyName) == null && System.getenv(envName) == null) {
            String value = dotenv.get(envName);
            if (value != null) {
                System.setProperty(propertyName, value);
            }
        }
    }
}