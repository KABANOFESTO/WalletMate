package rw.financial.walletmate.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import rw.financial.walletmate.security.user.UserDetailService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class AuthTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    private final JwtUtil jwtUtils;
    private final UserDetailService userDetailsService;

    public AuthTokenFilter(JwtUtil jwtUtils, UserDetailService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            logger.debug("JWT token from request: {}", jwt);

            if (jwt != null) {
                boolean isValid = jwtUtils.validateToken(jwt);
                logger.debug("Is token valid? {}", isValid);

                if (isValid) {
                    String email = jwtUtils.getUserNameFromToken(jwt);
                    List<String> roles = jwtUtils.getRolesFromToken(jwt);
                    logger.debug("User email from token: {}", email);
                    logger.debug("User roles from token: {}", roles);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    logger.debug("Loaded UserDetails: {}", userDetails);
                    
                    List<SimpleGrantedAuthority> authorities = roles.stream()
                            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                            .collect(Collectors.toList());
                    logger.debug("Created authorities: {}", authorities);

                    var authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                    );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    logger.info("Successfully authenticated user {} with roles {}", email, roles);
                }
            } else {
                logger.debug("No JWT token found in request");
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", headerAuth);

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        logger.debug("Checking if should not filter path: {}", path);
        
        boolean shouldNotFilter = path.equals("/error") || 
               path.startsWith("/public/") || 
               path.startsWith("/api/auth/") ||
               path.equals("/api/users/signup");
               
        logger.debug("Should not filter: {}", shouldNotFilter);
        return shouldNotFilter;
    }
}