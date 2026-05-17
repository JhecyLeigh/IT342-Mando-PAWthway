package edu.cit.mando.vetclinic.controller;

import edu.cit.mando.vetclinic.dto.AppointmentRequest;
import edu.cit.mando.vetclinic.dto.AppointmentResponse;
import edu.cit.mando.vetclinic.entity.Appointment;
import edu.cit.mando.vetclinic.entity.Pet;
import edu.cit.mando.vetclinic.entity.User;
import edu.cit.mando.vetclinic.repository.PetRepository;
import edu.cit.mando.vetclinic.repository.UserRepository;
import edu.cit.mando.vetclinic.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    // Get all appointments
    @GetMapping
    public ResponseEntity<?> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentService.getAllAppointments();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving appointments: " + e.getMessage());
        }
    }

    // Get appointments by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAppointmentsByUser(@PathVariable Long userId) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsByUser(userId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving user appointments: " + e.getMessage());
        }
    }

    // Get appointments by clinic ID
    @GetMapping("/clinic/{clinicId}")
    public ResponseEntity<?> getAppointmentsByClinic(@PathVariable Long clinicId) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsByClinic(clinicId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving clinic appointments: " + e.getMessage());
        }
    }

    // Get appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        try {
            Optional<Appointment> appointment = appointmentService.getAppointmentById(id);
            if (appointment.isPresent()) {
                return ResponseEntity.ok(appointment.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Appointment not found");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving appointment: " + e.getMessage());
        }
    }

    // Create new appointment
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentRequest request) {
        try {
            // Validate user exists
            Optional<User> user = userRepository.findById(request.getUserId());
            if (!user.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // Validate pet exists
            Optional<Pet> pet = petRepository.findById(request.getPetId());
            if (!pet.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pet not found");
            }

            // Create appointment
            Appointment appointment = new Appointment();
            appointment.setUser(user.get());
            appointment.setClinicId(request.getClinicId());
            appointment.setPet(pet.get());
            appointment.setPetType(request.getPetType());
            appointment.setPetAge(request.getPetAge());
            appointment.setService(request.getService());
            appointment.setAppointmentDateTime(request.getAppointmentDateTime());
            appointment.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
            appointment.setNotes(request.getNotes());

            Appointment createdAppointment = appointmentService.createAppointment(appointment);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAppointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating appointment: " + e.getMessage());
        }
    }

    // Update appointment
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody AppointmentRequest request) {
        try {
            Optional<Appointment> appointmentOpt = appointmentService.getAppointmentById(id);
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Appointment not found");
            }

            Appointment appointment = appointmentOpt.get();

            // Update fields if provided
            if (request.getClinicId() != null) {
                appointment.setClinicId(request.getClinicId());
            }
            if (request.getPetType() != null) {
                appointment.setPetType(request.getPetType());
            }
            if (request.getPetAge() != null) {
                appointment.setPetAge(request.getPetAge());
            }
            if (request.getService() != null) {
                appointment.setService(request.getService());
            }
            if (request.getAppointmentDateTime() != null) {
                appointment.setAppointmentDateTime(request.getAppointmentDateTime());
            }
            if (request.getStatus() != null) {
                appointment.setStatus(request.getStatus());
            }
            if (request.getNotes() != null) {
                appointment.setNotes(request.getNotes());
            }

            Appointment updatedAppointment = appointmentService.updateAppointment(appointment);
            return ResponseEntity.ok(updatedAppointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating appointment: " + e.getMessage());
        }
    }

    // Delete appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        try {
            Optional<Appointment> appointmentOpt = appointmentService.getAppointmentById(id);
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Appointment not found");
            }

            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok("Appointment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting appointment: " + e.getMessage());
        }
    }

    // Get appointments by status
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getAppointmentsByStatus(@PathVariable String status) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsByStatus(status);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving appointments by status: " + e.getMessage());
        }
    }
}
