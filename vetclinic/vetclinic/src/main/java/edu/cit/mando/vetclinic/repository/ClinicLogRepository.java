package edu.cit.mando.vetclinic.repository;

import edu.cit.mando.vetclinic.entity.ClinicLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicLogRepository extends JpaRepository<ClinicLog, Long> {
    List<ClinicLog> findByClinicIdOrderByCreatedAtDesc(Long clinicId);
}
