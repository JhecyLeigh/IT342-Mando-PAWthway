package edu.cit.mando.vetclinic.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "clinic_id", nullable = false)
    private Long clinicId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "pet_type", nullable = false, length = 100)
    private String petType;

    @Column(name = "pet_age")
    private Integer petAge;

    @Column(name = "service", nullable = false, length = 500)
    private String service;

    @Column(name = "appointment_date_time", nullable = false)
    private LocalDateTime appointmentDateTime;

    @Column(name = "status", length = 255)
    private String status;

    @Column(name = "notes", length = 1000)
    private String notes;

    // Constructors
    public Appointment() {}

    public Appointment(User user, Long clinicId, Pet pet, String petType, Integer petAge, 
                       String service, LocalDateTime appointmentDateTime, String status, String notes) {
        this.user = user;
        this.clinicId = clinicId;
        this.pet = pet;
        this.petType = petType;
        this.petAge = petAge;
        this.service = service;
        this.appointmentDateTime = appointmentDateTime;
        this.status = status;
        this.notes = notes;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Long getClinicId() {
        return clinicId;
    }

    public Pet getPet() {
        return pet;
    }

    public String getPetType() {
        return petType;
    }

    public Integer getPetAge() {
        return petAge;
    }

    public String getService() {
        return service;
    }

    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public String getStatus() {
        return status;
    }

    public String getNotes() {
        return notes;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setClinicId(Long clinicId) {
        this.clinicId = clinicId;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public void setPetType(String petType) {
        this.petType = petType;
    }

    public void setPetAge(Integer petAge) {
        this.petAge = petAge;
    }

    public void setService(String service) {
        this.service = service;
    }

    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public String toString() {
        return "Appointment{" +
                "id=" + id +
                ", user=" + user +
                ", clinicId=" + clinicId +
                ", pet=" + pet +
                ", petType='" + petType + '\'' +
                ", petAge=" + petAge +
                ", service='" + service + '\'' +
                ", appointmentDateTime=" + appointmentDateTime +
                ", status='" + status + '\'' +
                ", notes='" + notes + '\'' +
                '}';
    }
}
