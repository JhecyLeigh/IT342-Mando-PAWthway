package edu.cit.mando.vetclinic.service;

import edu.cit.mando.vetclinic.dto.LoginRequest;
import edu.cit.mando.vetclinic.dto.RegisterRequest;
import edu.cit.mando.vetclinic.entity.User;
import edu.cit.mando.vetclinic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service

public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setUsername(buildUsername(request));
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }

    private String buildUsername(RegisterRequest request) {
        String first = request.getFirstname() == null ? "" : request.getFirstname().trim();
        String last = request.getLastname() == null ? "" : request.getLastname().trim();
        String fullName = (first + " " + last).trim();
        return fullName.isEmpty() ? request.getEmail() : fullName;
    }
}
