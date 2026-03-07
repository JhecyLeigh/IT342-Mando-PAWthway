package edu.cit.mando.vetclinic.dto;
import lombok.Data;
@Data
public class RegisterRequest {
    private String firstname;
    private String lastname;
    private String email;
    private String password;
}