package rw.financial.walletmate.security.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

import lombok.RequiredArgsConstructor;
import rw.financial.walletmate.model.User;
import rw.financial.walletmate.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserDetailService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserDetailService.class);
    
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("Loading user details for email: {}", email);
        
        rw.financial.walletmate.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });
                
        logger.debug("Found user: id={}, email={}, role={}, password={}", 
            user.getId(), user.getEmail(), user.getRole(), 
            user.getPassword() != null ? user.getPassword().substring(0, 10) + "..." : "null");

        List<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            true, // enabled
            true, // accountNonExpired
            true, // credentialsNonExpired
            true, // accountNonLocked
            authorities
        );
    }
}
