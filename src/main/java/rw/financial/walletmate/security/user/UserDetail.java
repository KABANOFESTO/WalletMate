package rw.financial.walletmate.security.user;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import rw.financial.walletmate.model.User;

import java.util.Collection;
import java.util.Collections;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDetail implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private Collection<GrantedAuthority> authorities;

    /**
     * Builds VubaDetails from the given User model.
     * 
     * @param user the user entity from which to build VubaDetails
     * @return VubaDetails instance
     */
    public static UserDetail buildUserDetails(User user) {
        // Create authority from user role
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        
        return new UserDetail(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
