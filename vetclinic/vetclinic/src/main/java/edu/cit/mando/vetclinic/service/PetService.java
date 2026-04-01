package edu.cit.mando.vetclinic.service;

import edu.cit.mando.vetclinic.dto.PetRequest;
import edu.cit.mando.vetclinic.entity.Pet;
import edu.cit.mando.vetclinic.entity.User;
import edu.cit.mando.vetclinic.repository.PetRepository;
import edu.cit.mando.vetclinic.repository.UserRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PetService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Pet> getPetsByUserId(Long userId) {
        return petRepository.findByUserIdOrderByPetNameAsc(userId);
    }

    public Pet registerPet(PetRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("User is required");
        }
        if (request.getPetName() == null || request.getPetName().trim().isEmpty()) {
            throw new RuntimeException("Pet name is required");
        }
        if (request.getPetType() == null || request.getPetType().trim().isEmpty()) {
            throw new RuntimeException("Pet type is required");
        }
        if (request.getAge() != null && request.getAge() < 0) {
            throw new RuntimeException("Age cannot be negative");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = new Pet();
        pet.setUser(user);
        pet.setPetName(request.getPetName().trim());
        pet.setPetType(request.getPetType().trim());
        pet.setAge(request.getAge());
        return petRepository.save(pet);
    }

    public Pet updatePet(Long petId, PetRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("User is required");
        }
        if (request.getPetName() == null || request.getPetName().trim().isEmpty()) {
            throw new RuntimeException("Pet name is required");
        }
        if (request.getPetType() == null || request.getPetType().trim().isEmpty()) {
            throw new RuntimeException("Pet type is required");
        }
        if (request.getAge() != null && request.getAge() < 0) {
            throw new RuntimeException("Age cannot be negative");
        }

        Pet pet = petRepository.findByIdAndUserId(petId, request.getUserId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        pet.setPetName(request.getPetName().trim());
        pet.setPetType(request.getPetType().trim());
        pet.setAge(request.getAge());
        return petRepository.save(pet);
    }

    public void deletePet(Long petId, Long userId) {
        if (userId == null) {
            throw new RuntimeException("User is required");
        }

        Pet pet = petRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        petRepository.delete(pet);
    }
}
