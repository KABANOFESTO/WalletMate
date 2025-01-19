package rw.financial.walletmate.security;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import rw.financial.walletmate.security.jwt.AuthTokenFilter;
import rw.financial.walletmate.security.jwt.JwtAuthEntryPoint;
import rw.financial.walletmate.security.jwt.JwtUtil;
import rw.financial.walletmate.security.user.UserDetailService;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true, prePostEnabled = true)
public class WebSecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(WebSecurityConfig.class);

    private final UserDetailService userDetailsService;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final JwtUtil jwtUtil;
    private final SecurityConfig securityConfig;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public AuthTokenFilter authenticationTokenFilter() {
        logger.debug("Creating AuthTokenFilter bean");
        return new AuthTokenFilter(jwtUtil, userDetailsService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.debug("Configuring SecurityFilterChain");

        http.authenticationProvider(securityConfig.authenticationProvider());
        
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                auth
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/users/signup").permitAll()
                    .requestMatchers("/error").permitAll()
                    .requestMatchers("/public/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Allow Swagger UI access
                    .requestMatchers("/actuator/**").hasRole("ADMIN") // Actuator endpoints for admins only
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers("/api/users/**").hasAnyRole("USER", "ADMIN")
                    .requestMatchers("/api/transactions/**").hasAnyRole("USER", "ADMIN")
                    .requestMatchers("/api/accounts/**").hasAnyRole("USER", "ADMIN")
                    .requestMatchers("/api/categories/**").hasAnyRole("USER", "ADMIN")
                    .requestMatchers("/api/budgets/**").hasAnyRole("USER", "ADMIN")
                    .requestMatchers("/api/reports/**").hasAnyRole("USER", "ADMIN")
                    .anyRequest().authenticated();
                logger.debug("URL authorization patterns configured");
            });

        http.addFilterBefore(authenticationTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        logger.debug("Added JWT authentication filter");

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        logger.debug("Configuring CORS");
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:[*]", "http://127.0.0.1:[*]"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        logger.debug("CORS configuration applied");
        return source;
    }
}