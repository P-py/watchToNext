package com.watchtonext.api.service

import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import java.time.Instant

class UserProvisioningFilterTest {

    private val userProvisioningService = mockk<UserProvisioningService>()
    private val filter = UserProvisioningFilter(userProvisioningService)

    private fun newExchange(): Triple<MockHttpServletRequest, MockHttpServletResponse, MockFilterChain> =
        Triple(MockHttpServletRequest(), MockHttpServletResponse(), MockFilterChain())

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
    }

    private fun jwt(): Jwt = Jwt.withTokenValue("token")
        .header("alg", "none")
        .subject("11111111-1111-1111-1111-111111111111")
        .issuedAt(Instant.parse("2026-01-01T00:00:00Z"))
        .expiresAt(Instant.parse("2026-01-01T01:00:00Z"))
        .claim("preferred_username", "alice")
        .build()

    private fun setAuth(authentication: org.springframework.security.core.Authentication) {
        val ctx = SecurityContextHolder.createEmptyContext()
        ctx.authentication = authentication
        SecurityContextHolder.setContext(ctx)
    }

    @Test
    fun `provisions when authentication is a JwtAuthenticationToken`() {
        val token = JwtAuthenticationToken(jwt())
        setAuth(token)
        every { userProvisioningService.provision(any()) } returns mockk()

        val (req, res, chain) = newExchange()
        filter.doFilter(req, res, chain)

        verify(exactly = 1) { userProvisioningService.provision(token.token) }
        assertThat(chain.request).isSameAs(req)
    }

    @Test
    fun `skips provisioning when there is no authentication`() {
        val (req, res, chain) = newExchange()
        filter.doFilter(req, res, chain)

        verify(exactly = 0) { userProvisioningService.provision(any()) }
        assertThat(chain.request).isSameAs(req)
    }

    @Test
    fun `skips provisioning when authentication is not a JwtAuthenticationToken`() {
        setAuth(UsernamePasswordAuthenticationToken("user", "pwd"))

        val (req, res, chain) = newExchange()
        filter.doFilter(req, res, chain)

        verify(exactly = 0) { userProvisioningService.provision(any()) }
        assertThat(chain.request).isSameAs(req)
    }

    @Test
    fun `swallows service exception and still continues the chain`() {
        val token = JwtAuthenticationToken(jwt())
        setAuth(token)
        every { userProvisioningService.provision(any()) } throws RuntimeException("db down")

        val (req, res, chain) = newExchange()
        filter.doFilter(req, res, chain)

        verify(exactly = 1) { userProvisioningService.provision(token.token) }
        assertThat(chain.request).isSameAs(req)
    }
}
