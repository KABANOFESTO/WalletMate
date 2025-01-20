package rw.financial.walletmate.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import rw.financial.walletmate.model.User;

import javax.annotation.PostConstruct;
import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    private Key secretKey;

    @PostConstruct
    private void init() {
        logger.debug("Initializing JWT secret key");
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(User user) {
        logger.debug("Generating token for user: {}", user.getEmail());
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        
        String token = Jwts.builder()
                .setSubject(user.getEmail())
                .claim("roles", Collections.singletonList(user.getRole().name()))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
        
        logger.debug("Generated token: {}", token);
        return token;
    }

    public String getUserNameFromToken(String token) {
        Claims claims = extractClaims(token);
        String username = claims.getSubject();
        logger.debug("Extracted username from token: {}", username);
        return username;
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = extractClaims(token);
        List<String> roles = claims.get("roles", List.class);
        logger.debug("Extracted roles from token: {}", roles);
        return roles;
    }

    public boolean validateToken(String token) {
        try {
            logger.debug("Validating token: {}", token);
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
            
            // Check if token is expired
            Date expiration = claims.getExpiration();
            boolean isExpired = expiration.before(new Date());
            logger.debug("Token expiration date: {}, is expired: {}", expiration, isExpired);
            
            return !isExpired;
        } catch (Exception e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public Claims extractClaims(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            logger.debug("Successfully extracted claims from token: {}", claims);
            return claims;
        } catch (Exception e) {
            logger.error("Error extracting claims from token: {}", e.getMessage());
            throw e;
        }
    }
}
