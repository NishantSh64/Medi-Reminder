package com.nishant.medicine_reminder.service;

import com.nishant.medicine_reminder.model.User;
import com.nishant.medicine_reminder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: "));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),  // which returns email
                user.getPassword(),
                new ArrayList<>()  // roles/authorities here if any
        );
    }
}
