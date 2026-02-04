package com.vaxify.app.security;

import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http)
                        throws Exception {

                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/knock-knock").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/hospitals/**").permitAll()
                                                .requestMatchers("/api/hospitals/register").permitAll()
                                                .requestMatchers("/api/files/**").permitAll()

                                                // slot management
                                                // staff can create / update / delete
                                                .requestMatchers("/api/slots/staff/**")
                                                .hasRole("STAFF")

                                                // staff can create / update / delete
                                                .requestMatchers(HttpMethod.GET, "/api/slots")
                                                .hasAnyRole("USER", "STAFF", "ADMIN")

                                                // vaccine management
                                                // staff can create / update / delete
                                                .requestMatchers("/api/vaccines/staff/**").hasRole("STAFF")

                                                // staff can create / update / delete
                                                .requestMatchers(HttpMethod.GET, "/api/vaccines/**")
                                                .hasAnyRole("USER", "STAFF", "ADMIN")
                                                .requestMatchers("/api/users/**").authenticated()
                                                .requestMatchers("/api/appointments/**").authenticated()
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))
                                .addFilterBefore(
                                                jwtAuthFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Value("${ALLOWED_ORIGINS:http://localhost:5173}")
        private String allowedOrigins;

        @Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration("/**", configuration);

                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
