package edu.cit.mando.vetclinic.service;

import edu.cit.mando.pawthway.dto.LoginRequest;

import edu.cit.mando.pawthway.dto.RegisterRequest;

import edu.cit.mando.pawthway.entity.User;

import edu.cit.mando.pawthway.repository.UserRepository;

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

}
