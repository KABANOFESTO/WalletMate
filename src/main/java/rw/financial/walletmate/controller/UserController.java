package rw.financial.walletmate.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import rw.financial.walletmate.model.Role;
import rw.financial.walletmate.model.User;
import rw.financial.walletmate.security.jwt.JwtUtil;
import rw.financial.walletmate.service.IUserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final IUserService userService;
    private final JwtUtil jwtUtil;

    public UserController(IUserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // Endpoint for user registration
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
        try {
            logger.debug("Attempting to register new user with email: {}", user.getEmail());
            
            // Set default role if not provided
            if (user.getRole() == null) {
                user.setRole(Role.USER);
                logger.debug("Setting default role to USER for new user");
            }
            
            userService.createUser(user);
            logger.info("Successfully registered new user with email: {}", user.getEmail());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body("User registered successfully");
        } catch (Exception e) {
            logger.error("Error during user registration: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error during user registration: " + e.getMessage());
        }
    }

    // Endpoint to fetch all users
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            // Remove "Bearer " from the token
            String jwtToken = authorizationHeader.substring(7);
            Claims claims = jwtUtil.extractClaims(jwtToken);

            // Extract the user's roles from the token
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);
            
            // Check if the user has ADMIN or USER role
            if (roles == null || roles.isEmpty() || 
                (!roles.contains(Role.ADMIN.name()) && !roles.contains(Role.USER.name()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Insufficient privileges");
            }

            // Fetch the list of users
            List<User> users = userService.getUsers();
            return ResponseEntity.ok(users);

        } catch (JwtException e) {
            // Handle JWT-specific exceptions
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        } catch (Exception e) {
            // Catch all other exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching the users");
        }
    }

    // Endpoint to fetch user by email
    @GetMapping("/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable("email") String email) {
        try {
            User theUser = userService.getUser(email);
            return ResponseEntity.ok(theUser);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching user");
        }
    }

    // Endpoint to delete a user by email
    @DeleteMapping("/delete/{email}")
    public ResponseEntity<String> deleteUser(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable("email") String email) {
        try {
            // Extract and validate JWT token
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authorization token is required");
            }

            // Remove "Bearer " from the token
            String jwtToken = authorizationHeader.substring(7);
            Claims claims = jwtUtil.extractClaims(jwtToken);

            // Extract the user's role from the token
            String userRole = claims.get("role", String.class);
            String tokenUserEmail = claims.getSubject(); // Get email from token

            // Check if the user has ADMIN privileges
            if (!Role.ADMIN.name().equals(userRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Only administrators can delete users");
            }

            // Prevent admin from deleting their own account
            if (email.equals(tokenUserEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot delete your own admin account");
            }

            // Proceed with deletion
            userService.deleteUser(email);
            return ResponseEntity.ok("User deleted successfully");

        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting user: " + e.getMessage());
        }
    }
}
