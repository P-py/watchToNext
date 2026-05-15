package com.watchtonext.api.service

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Provisions the [com.watchtonext.api.persistence.entity.UserEntity] backing the JWT
 * `sub` on every authenticated request. Wired in [com.watchtonext.api.config.SecurityConfig]
 * after the bearer-token authentication filter, so [SecurityContextHolder] already carries
 * the validated principal here.
 *
 * Failure to persist is logged and swallowed — a transient DB issue must not break domain
 * requests (the user can still browse the catalog and consume their previously-persisted state).
 */
@Component
class UserProvisioningFilter(
    private val userProvisioningService: UserProvisioningService,
) : OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication is JwtAuthenticationToken) {
            try {
                userProvisioningService.provision(authentication.token)
            } catch (ex: Exception) {
                log.warn(
                    "User provisioning failed for sub={}: {}",
                    authentication.token.subject,
                    ex.message,
                )
            }
        }
        filterChain.doFilter(request, response)
    }
}
