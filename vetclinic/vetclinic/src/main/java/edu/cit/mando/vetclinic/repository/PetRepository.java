package edu.cit.mando.vetclinic.repository;

import edu.cit.mando.vetclinic.entity.Pet;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PetRepository extends JpaRepository<Pet, Long> {
    @EntityGraph(attributePaths = "user")
    List<Pet> findByUserIdOrderByPetNameAsc(Long userId);

    @EntityGraph(attributePaths = "user")
    Optional<Pet> findByIdAndUserId(Long id, Long userId);
}
