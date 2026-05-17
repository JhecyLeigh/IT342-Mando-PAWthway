package edu.cit.mando.vetclinic.controller;

import edu.cit.mando.vetclinic.dto.AdminDashboardResponse;
import edu.cit.mando.vetclinic.dto.AppointmentResponse;
import edu.cit.mando.vetclinic.dto.ClinicLogResponse;
import edu.cit.mando.vetclinic.entity.Appointment;
import edu.cit.mando.vetclinic.entity.ClinicLog;
import edu.cit.mando.vetclinic.entity.User;
import edu.cit.mando.vetclinic.repository.UserRepository;
import edu.cit.mando.vetclinic.service.AppointmentService;
import edu.cit.mando.vetclinic.service.ClinicLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private ClinicLogService clinicLogService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@RequestParam Long adminUserId) {
        try {
            User admin = requireAdmin(adminUserId);
            List<Appointment> clinicAppointments = appointmentService.getAppointmentsByClinic(admin.getClinicId());
            List<ClinicLog> logs = clinicLogService.getLogsByClinicId(admin.getClinicId());

            AdminDashboardResponse response = new AdminDashboardResponse();
            response.setClinicId(admin.getClinicId());
            response.setClinicName("Clinic #" + admin.getClinicId());
            response.setTotalAppointments(clinicAppointments.size());
            response.setPendingAppointments(clinicAppointments.stream().filter(item -> "PENDING".equalsIgnoreCase(item.getStatus())).count());
            response.setConfirmedAppointments(clinicAppointments.stream().filter(item -> "CONFIRMED".equalsIgnoreCase(item.getStatus())).count());
            response.setTotalLogs(logs.size());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getClinicAppointments(@RequestParam Long adminUserId) {
        try {
            User admin = requireAdmin(adminUserId);
            List<AppointmentResponse> appointments = appointmentService.getAppointmentsByClinic(admin.getClinicId())
                    .stream()
                    .map(this::toResponse)
                    .toList();
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/appointments/pending")
    public ResponseEntity<?> getPendingAppointments(@RequestParam Long adminUserId) {
        try {
            User admin = requireAdmin(adminUserId);
            List<AppointmentResponse> appointments = appointmentService
                    .getAppointmentsByClinicAndStatus(admin.getClinicId(), "PENDING")
                    .stream()
                    .map(this::toResponse)
                    .toList();
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PatchMapping("/appointments/{appointmentId}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long appointmentId, @RequestParam Long adminUserId) {
        try {
            User admin = requireAdmin(adminUserId);
            Optional<Appointment> appointmentOpt = appointmentService.getAppointmentById(appointmentId);
            if (appointmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Appointment not found");
            }

            Appointment appointment = appointmentOpt.get();
            if (!admin.getClinicId().equals(appointment.getClinicId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("This appointment does not belong to your clinic");
            }

            appointment.setStatus("CONFIRMED");
            Appointment updated = appointmentService.updateAppointment(appointment);
            clinicLogService.record(
                    updated.getClinicId(),
                    updated.getId(),
                    admin.getId(),
                    "ADMIN",
                    buildOwnerName(admin),
                    "APPOINTMENT_CONFIRMED",
                    "Appointment confirmed by clinic admin"
            );
            return ResponseEntity.ok(toResponse(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(@RequestParam Long adminUserId) {
        try {
            User admin = requireAdmin(adminUserId);
            List<ClinicLogResponse> response = clinicLogService.getLogsByClinicId(admin.getClinicId())
                    .stream()
                    .map(this::toResponse)
                    .toList();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private User requireAdmin(Long adminUserId) {
        User user = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Admin access required");
        }
        if (user.getClinicId() == null) {
            throw new RuntimeException("Admin clinic is not configured");
        }
        return user;
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setUserId(appointment.getUser().getId());
        response.setClinicId(appointment.getClinicId());
        response.setPetId(appointment.getPet().getId());
        response.setPetName(appointment.getPet().getPetName());
        response.setPetType(appointment.getPetType());
        response.setPetAge(appointment.getPetAge());
        response.setService(appointment.getService());
        response.setAppointmentDateTime(appointment.getAppointmentDateTime());
        response.setStatus(appointment.getStatus());
        response.setNotes(appointment.getNotes());
        response.setOwnerName(buildOwnerName(appointment.getUser()));
        response.setOwnerEmail(appointment.getUser().getEmail());
        return response;
    }

    private ClinicLogResponse toResponse(ClinicLog log) {
        ClinicLogResponse response = new ClinicLogResponse();
        response.setId(log.getId());
        response.setClinicId(log.getClinicId());
        response.setAppointmentId(log.getAppointmentId());
        response.setActorUserId(log.getActorUserId());
        response.setActorRole(log.getActorRole());
        response.setActorName(log.getActorName());
        response.setActionType(log.getActionType());
        response.setDetails(log.getDetails());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }

    private String buildOwnerName(User user) {
        String firstname = user.getFirstname() == null ? "" : user.getFirstname().trim();
        String lastname = user.getLastname() == null ? "" : user.getLastname().trim();
        String fullName = (firstname + " " + lastname).trim();
        return fullName.isEmpty() ? user.getUsername() : fullName;
    }
}
