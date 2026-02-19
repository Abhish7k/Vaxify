package com.vaxify.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/knock-knock")
public class TestController {

    @GetMapping
    public String test() {
        return "Who's there ?";
    }
}
