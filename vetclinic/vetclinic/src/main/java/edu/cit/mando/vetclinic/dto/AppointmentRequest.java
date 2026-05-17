package edu.cit.mando.vetclinic.dto;

import java.time.LocalDateTime;

public class AppointmentRequest {
    private Long userId;
    private Long clinicId;
    private Long petId;
    private String petType;
    private Integer petAge;
    private String service;
    private LocalDateTime appointmentDateTime;
    private String status;
    private String notes;

    // Constructors
    public AppointmentRequest() {}

    public AppointmentRequest(Long userId, Long clinicId, Long petId, String petType, Integer petAge,
                             String service, LocalDateTime appointmentDateTime, String status, String notes) {
        this.userId = userId;
        this.clinicId = clinicId;
        this.petId = petId;
        this.petType = petType;
        this.petAge = petAge;
        this.service = service;
        this.appointmentDateTime = appointmentDateTime;
        this.status = status;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getClinicId() {
        return clinicId;
    }

    public void setClinicId(Long clinicId) {
        this.clinicId = clinicId;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public String getPetType() {
        return petType;
    }

    public void setPetType(String petType) {
        this.petType = petType;
    }

    public Integer getPetAge() {
        return petAge;
    }

    public void setPetAge(Integer petAge) {
        this.petAge = petAge;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
