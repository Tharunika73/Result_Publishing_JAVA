package com.saerp.security;

import com.saerp.entity.User;
import com.saerp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("DEBUG: User not found for email: " + email);
                    return new UsernameNotFoundException("User not found: " + email);
                });

        System.out.println("DEBUG: Found user: " + user.getEmail() + " | Hash: " + user.getPasswordHash() + " | Active: " + user.getIsActive());

        if (user.getIsActive() == null || !user.getIsActive()) {
            System.out.println("DEBUG: User account is disabled or null for: " + email);
            throw new UsernameNotFoundException("User account is disabled: " + email);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}
