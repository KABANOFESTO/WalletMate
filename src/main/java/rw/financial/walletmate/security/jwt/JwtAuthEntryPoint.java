package rw.financial.walletmate.security.jwt;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthEntryPoint.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException {
        logger.error("Unauthorized error: {}", authException.getMessage());
        logger.debug("Request URI: {}", request.getRequestURI());
        logger.debug("Request method: {}", request.getMethod());
        logger.debug("Authorization header: {}", request.getHeader("Authorization"));
        
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        errorDetails.put("error", "Unauthorized");
        errorDetails.put("message", authException.getMessage());
        errorDetails.put("path", request.getRequestURI());
        errorDetails.put("timestamp", new Date());
        
        String jsonError = objectMapper.writeValueAsString(errorDetails);
        response.getWriter().write(jsonError);
    }
}
