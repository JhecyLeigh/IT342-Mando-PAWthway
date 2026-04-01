package edu.cit.mando.vetclinic.dto;

import edu.cit.mando.vetclinic.entity.Pet;

public class PetResponse {

    private Long id;
    private Long userId;
    private String petName;
    private String petType;
    private Integer age;

    public static PetResponse fromEntity(Pet pet) {
        PetResponse response = new PetResponse();
        response.setId(pet.getId());
        response.setUserId(pet.getUser().getId());
        response.setPetName(pet.getPetName());
        response.setPetType(pet.getPetType());
        response.setAge(pet.getAge());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPetName() {
        return petName;
    }

    public void setPetName(String petName) {
        this.petName = petName;
    }

    public String getPetType() {
        return petType;
    }

    public void setPetType(String petType) {
        this.petType = petType;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
}
