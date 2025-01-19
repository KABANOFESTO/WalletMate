package rw.financial.walletmate.controller.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import rw.financial.walletmate.model.User;
import rw.financial.walletmate.repository.UserRepository;
import rw.financial.walletmate.request.LoginRequest;
import rw.financial.walletmate.security.jwt.JwtUtil;
import rw.financial.walletmate.security.user.UserDetail;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5501", "http://localhost:3000"}, 
             allowCredentials = "true",
             maxAge = 3600)
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            logger.info("Login attempt for user: {}", request.getEmail());

            // First check if user exists
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", request.getEmail());
                    return new UsernameNotFoundException("User not found with email: " + request.getEmail());
                });
            logger.debug("Found user in database: id={}, email={}, role={}", 
                user.getId(), user.getEmail(), user.getRole());

            try {
                // Create authentication token
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
                logger.debug("Created authentication token for user: {}", request.getEmail());

                // Authenticate the user
                Authentication authentication = authenticationManager.authenticate(authToken);
                logger.debug("Authentication successful for user: {}", request.getEmail());
                
                // Set the authentication in SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.debug("SecurityContext updated with authentication");
                
                // Generate JWT token
                String token = jwtUtil.generateToken(user);
                logger.debug("Generated JWT token for user");
                
                // Create response
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("id", user.getId());
                response.put("email", user.getEmail());
                response.put("name", user.getName());
                response.put("role", user.getRole());
                
                logger.info("User {} successfully logged in", request.getEmail());
                return ResponseEntity.ok(response);
            } catch (BadCredentialsException e) {
                logger.error("Bad credentials for user {}", request.getEmail(), e);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Authentication failed");
                errorResponse.put("message", "Invalid password");
                return ResponseEntity.status(401).body(errorResponse);
            } catch (AuthenticationException e) {
                logger.error("Authentication failed for user {}: {}", request.getEmail(), e.getMessage(), e);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Authentication failed");
                errorResponse.put("message", e.getMessage());
                return ResponseEntity.status(401).body(errorResponse);
            }
        } catch (UsernameNotFoundException e) {
            logger.error("Login failed - User not found: {}", request.getEmail(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed");
            errorResponse.put("message", "User not found");
            return ResponseEntity.status(401).body(errorResponse);
        } catch (Exception e) {
            logger.error("Unexpected error during login for user {}", request.getEmail(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", "An unexpected error occurred");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid token format");
            }

            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                String userEmail = jwtUtil.getUserNameFromToken(token);
                User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("id", user.getId());
                response.put("email", user.getEmail());
                response.put("name", user.getName());
                response.put("role", user.getRole());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body("Invalid token");
            }
        } catch (Exception e) {
            logger.error("Error validating token", e);
            return ResponseEntity.status(500).body("Error validating token");
        }
    }
}
