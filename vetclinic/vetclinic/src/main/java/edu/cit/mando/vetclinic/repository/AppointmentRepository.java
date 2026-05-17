package edu.cit.mando.vetclinic.repository;

import edu.cit.mando.vetclinic.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Override
    @EntityGraph(attributePaths = {"user", "pet"})
    Optional<Appointment> findById(Long id);

    @EntityGraph(attributePaths = {"user", "pet"})
    List<Appointment> findByUser_Id(Long userId);

    @EntityGraph(attributePaths = {"user", "pet"})
    List<Appointment> findByClinicId(Long clinicId);

    @EntityGraph(attributePaths = {"user", "pet"})
    List<Appointment> findByClinicIdAndStatus(Long clinicId, String status);

    @EntityGraph(attributePaths = {"user", "pet"})
    List<Appointment> findByStatus(String status);
}
