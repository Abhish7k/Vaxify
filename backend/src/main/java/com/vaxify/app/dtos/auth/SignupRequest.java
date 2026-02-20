package com.vaxify.app.dtos.auth;

import com.vaxify.app.entities.enums.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {

    private String name;

    private String email;

    private String password;

    private String phone;

    private Role role;

}
