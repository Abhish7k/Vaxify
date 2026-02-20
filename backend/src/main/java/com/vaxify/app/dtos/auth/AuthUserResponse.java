package com.vaxify.app.dtos.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthUserResponse {

    private Long id;

    private String name;

    private String email;

    private String role;

    private String createdAt;

}
