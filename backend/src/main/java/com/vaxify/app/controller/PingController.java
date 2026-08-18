package com.vaxify.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// lightweight public endpoint used by the frontend to warm up the backend
// (free-tier hosts spin down when idle, so the first request pays a cold start)
@RestController
@RequestMapping("/api/ping")
public class PingController {

    @GetMapping
    public String ping() {
        return "pong";
    }
}
