package com.vaxify.app.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http)
                        throws Exception {

                http
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/hospitals/register").permitAll()
                                                .requestMatchers("/auth/**").permitAll()
                                                .requestMatchers("/api/files/**").permitAll()
                                                // ---------- SLOT MANAGEMENT ----------
                                                // STAFF can create / update / delete
                                                .requestMatchers("/api/slots/staff/**")
                                                .hasRole("STAFF")
                                                // STAFF can create / update / delete
                                                .requestMatchers(HttpMethod.GET, "/api/slots")
                                                .hasAnyRole("USER", "STAFF", "ADMIN")
                                                // ---------- VACCINE MANAGEMENT ----------
                                                // STAFF can create / update / delete
                                                .requestMatchers("/api/vaccines/staff/**").hasRole("STAFF")
                                                // STAFF can create / update / delete
                                                .requestMatchers(HttpMethod.GET, "/api/vaccines/**")
                                                .hasAnyRole("USER", "STAFF", "ADMIN")
                                                .requestMatchers("/api/users/**").authenticated()
                                                .requestMatchers("/appointments**").authenticated()
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))
                                .addFilterBefore(
                                                jwtAuthFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
