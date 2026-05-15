package com.watchtonext.api.config

import com.watchtonext.api.service.UserProvisioningFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

/**
 * Auth wiring:
 *  - Bearer JWT validated against the Keycloak JWK set (URI configured in application.properties).
 *  - Catalog reads (movies + similar recommendations) are public.
 *  - Personal endpoints (rating/favorite mutations, personal recommendations) require authentication.
 *  - Stateless: no Spring-managed session, CSRF off (browser flows go through the Next BFF).
 */
@Configuration
class SecurityConfig(
    private val corsProperties: CorsProperties,
    private val jwtConverter: JwtConverter,
    private val userProvisioningFilter: UserProvisioningFilter,
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain = http
        .cors { }
        .csrf { it.disable() }
        .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
        .authorizeHttpRequests {
            // Security sees the raw request URI; the `/api` global prefix is applied by
            // WebMvcConfig downstream (via PathMatchConfigurer.addPathPrefix). Matchers
            // here MUST include `/api` to match what's actually on the wire.
            it.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/movies", "/api/movies/popular", "/api/movies/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/recommendations/similar").permitAll()
                .anyRequest().authenticated()
        }
        .oauth2ResourceServer { oauth2 ->
            oauth2.jwt { jwt -> jwt.jwtAuthenticationConverter(jwtConverter) }
        }
        .addFilterAfter(userProvisioningFilter, BearerTokenAuthenticationFilter::class.java)
        .build()

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration().apply {
            allowedOrigins = corsProperties.origins
            allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
            maxAge = 3600
        }
        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", config)
        }
    }
}
