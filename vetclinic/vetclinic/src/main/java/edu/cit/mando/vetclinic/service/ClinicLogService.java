package edu.cit.mando.vetclinic.service;

import edu.cit.mando.vetclinic.entity.ClinicLog;
import edu.cit.mando.vetclinic.repository.ClinicLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClinicLogService {

    @Autowired
    private ClinicLogRepository clinicLogRepository;

    public ClinicLog record(Long clinicId, Long appointmentId, Long actorUserId, String actorRole, String actorName, String actionType, String details) {
        ClinicLog log = new ClinicLog();
        log.setClinicId(clinicId);
        log.setAppointmentId(appointmentId);
        log.setActorUserId(actorUserId);
        log.setActorRole(actorRole);
        log.setActorName(actorName);
        log.setActionType(actionType);
        log.setDetails(details);
        return clinicLogRepository.save(log);
    }

    public List<ClinicLog> getLogsByClinicId(Long clinicId) {
        return clinicLogRepository.findByClinicIdOrderByCreatedAtDesc(clinicId);
    }
}
