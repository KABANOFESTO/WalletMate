package rw.financial.walletmate.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import rw.financial.walletmate.security.user.UserDetailService;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    
    private final UserDetailService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        logger.debug("Creating BCryptPasswordEncoder bean");
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        logger.debug("Creating DaoAuthenticationProvider bean");
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        
        logger.debug("Configured DaoAuthenticationProvider with UserDetailsService and PasswordEncoder");
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        logger.debug("Creating AuthenticationManager bean");
        return authConfig.getAuthenticationManager();
    }
}
