package com.watchtonext.api.service

import com.watchtonext.api.persistence.entity.UserEntity
import com.watchtonext.api.persistence.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.jwt.Jwt
import java.time.Instant
import java.util.Optional
import java.util.UUID

class UserProvisioningServiceTest {

    private val userRepository = mockk<UserRepository>()
    private val service = UserProvisioningService(userRepository)

    private val subject = UUID.fromString("11111111-1111-1111-1111-111111111111")

    private fun jwt(claims: Map<String, Any>): Jwt = Jwt.withTokenValue("token")
        .header("alg", "none")
        .subject(subject.toString())
        .issuedAt(Instant.parse("2026-01-01T00:00:00Z"))
        .expiresAt(Instant.parse("2026-01-01T01:00:00Z"))
        .claims { it.putAll(claims) }
        .build()

    @Test
    fun `creates a new user from preferred_username when none exists`() {
        val token = jwt(
            mapOf(
                "preferred_username" to "alice",
                "name" to "Alice Doe",
                "email" to "alice@example.com",
            ),
        )
        val saved = slot<UserEntity>()
        every { userRepository.findById(subject) } returns Optional.empty()
        every { userRepository.save(capture(saved)) } answers { saved.captured }

        val result = service.provision(token)

        assertThat(result.id).isEqualTo(subject)
        assertThat(result.displayName).isEqualTo("alice")
        assertThat(result.email).isEqualTo("alice@example.com")
        verify(exactly = 1) { userRepository.save(any()) }
    }

    @Test
    fun `falls back to name claim when preferred_username is missing`() {
        val token = jwt(mapOf("name" to "Alice Doe", "email" to "alice@example.com"))
        every { userRepository.findById(subject) } returns Optional.empty()
        every { userRepository.save(any()) } answers { firstArg() }

        val result = service.provision(token)

        assertThat(result.displayName).isEqualTo("Alice Doe")
    }

    @Test
    fun `falls back to a synthetic name when both claims are absent`() {
        val token = jwt(emptyMap())
        every { userRepository.findById(subject) } returns Optional.empty()
        every { userRepository.save(any()) } answers { firstArg() }

        val result = service.provision(token)

        // First 8 chars of the subject UUID — "11111111".
        assertThat(result.displayName).isEqualTo("user-11111111")
    }

    @Test
    fun `email is null when the claim is absent`() {
        val token = jwt(mapOf("preferred_username" to "alice"))
        every { userRepository.findById(subject) } returns Optional.empty()
        every { userRepository.save(any()) } answers { firstArg() }

        val result = service.provision(token)

        assertThat(result.email).isNull()
    }

    @Test
    fun `returns the existing user without saving when claims match`() {
        val token = jwt(
            mapOf(
                "preferred_username" to "alice",
                "email" to "alice@example.com",
            ),
        )
        val existing = UserEntity(id = subject, displayName = "alice", email = "alice@example.com")
        every { userRepository.findById(subject) } returns Optional.of(existing)

        val result = service.provision(token)

        assertThat(result).isSameAs(existing)
        verify(exactly = 0) { userRepository.save(any()) }
    }

    @Test
    fun `existing user only has email reconciled when claims diverge`() {
        // preferred_username changed upstream too, but we no longer mirror it — the user
        // owns displayName via PATCH /users/me, so the IdP value is ignored on update.
        val token = jwt(
            mapOf(
                "preferred_username" to "alice2",
                "email" to "new@example.com",
            ),
        )
        val existing = UserEntity(id = subject, displayName = "alice", email = "alice@example.com")
        every { userRepository.findById(subject) } returns Optional.of(existing)
        every { userRepository.save(existing) } returns existing

        val result = service.provision(token)

        assertThat(result.displayName).isEqualTo("alice")
        assertThat(result.email).isEqualTo("new@example.com")
        verify(exactly = 1) { userRepository.save(existing) }
    }

    @Test
    fun `updates the user when only the email claim changes`() {
        val token = jwt(
            mapOf(
                "preferred_username" to "alice",
                "email" to "alice+work@example.com",
            ),
        )
        val existing = UserEntity(id = subject, displayName = "alice", email = "alice@example.com")
        every { userRepository.findById(subject) } returns Optional.of(existing)
        every { userRepository.save(existing) } returns existing

        service.provision(token)

        assertThat(existing.email).isEqualTo("alice+work@example.com")
        verify(exactly = 1) { userRepository.save(existing) }
    }

    @Test
    fun `ignores displayName drift for existing users (no save when only displayName differs)`() {
        val token = jwt(
            mapOf(
                "preferred_username" to "alice-renamed",
                "email" to "alice@example.com",
            ),
        )
        val existing = UserEntity(id = subject, displayName = "alice", email = "alice@example.com")
        every { userRepository.findById(subject) } returns Optional.of(existing)

        val result = service.provision(token)

        assertThat(result).isSameAs(existing)
        assertThat(result.displayName).isEqualTo("alice")
        verify(exactly = 0) { userRepository.save(any()) }
    }
}
