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
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail().split("@")[0]); // Generate username from email
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setClinicId(null);
        return userRepository.save(user);
    }

    public User registerAdmin(RegisterRequest request, Long clinicId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (clinicId == null) {
            throw new RuntimeException("Clinic is required for admin accounts");
        }

        User user = new User();
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail().split("@")[0]);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ADMIN");
        user.setClinicId(clinicId);
        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return user;
        }

        // Fallback for legacy accounts that were stored before password hashing was enforced.
        if (request.getPassword() != null && request.getPassword().equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            return userRepository.save(user);
        }

        throw new RuntimeException("Invalid password");
    }

}
