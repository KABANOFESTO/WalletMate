package rw.financial.walletmate.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import rw.financial.walletmate.exception.UnauthorizedException;
import rw.financial.walletmate.model.User;
import rw.financial.walletmate.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class SecurityUtils {
    private final UserRepository userRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));
    }
}