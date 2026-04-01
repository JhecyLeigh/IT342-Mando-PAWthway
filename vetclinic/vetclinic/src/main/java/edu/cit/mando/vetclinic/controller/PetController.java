package edu.cit.mando.vetclinic.controller;

import edu.cit.mando.vetclinic.dto.PetRequest;
import edu.cit.mando.vetclinic.dto.PetResponse;
import edu.cit.mando.vetclinic.entity.Pet;
import edu.cit.mando.vetclinic.service.PetService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pets")
@CrossOrigin(origins = "http://localhost:3000")
public class PetController {

    @Autowired
    private PetService petService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPetsByUser(@PathVariable Long userId) {
        try {
            List<PetResponse> pets = petService.getPetsByUserId(userId)
                    .stream()
                    .map(PetResponse::fromEntity)
                    .toList();
            return ResponseEntity.ok(pets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Unable to load pets: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> registerPet(@RequestBody PetRequest request) {
        try {
            Pet pet = petService.registerPet(request);
            return ResponseEntity.ok(PetResponse.fromEntity(pet));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Pet registration failed: " + e.getMessage());
        }
    }

    @PutMapping("/{petId}")
    public ResponseEntity<?> updatePet(@PathVariable Long petId, @RequestBody PetRequest request) {
        try {
            Pet pet = petService.updatePet(petId, request);
            return ResponseEntity.ok(PetResponse.fromEntity(pet));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Pet update failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<?> deletePet(@PathVariable Long petId, @RequestParam Long userId) {
        try {
            petService.deletePet(petId, userId);
            return ResponseEntity.ok("Pet deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Pet deletion failed: " + e.getMessage());
        }
    }
}
