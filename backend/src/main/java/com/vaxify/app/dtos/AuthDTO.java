package com.vaxify.app.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
}
