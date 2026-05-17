package edu.cit.mando.vetclinic.repository;

import edu.cit.mando.vetclinic.entity.Appointment;
import edu.cit.mando.vetclinic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUser(User user);
    List<Appointment> findByUserId(Long userId);
    List<Appointment> findByClinicId(Long clinicId);
    List<Appointment> findByStatus(String status);
}
