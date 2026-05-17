package edu.cit.mando.vetclinic.repository;

import edu.cit.mando.vetclinic.entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicRepository extends JpaRepository<Clinic, Long> {
}
