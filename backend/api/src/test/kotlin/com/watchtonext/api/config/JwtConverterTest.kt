package com.watchtonext.api.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.jwt.Jwt
import java.time.Instant

class JwtConverterTest {

    private val converter = JwtConverter()

    private fun jwt(claims: Map<String, Any>): Jwt = Jwt.withTokenValue("token")
        .header("alg", "none")
        .subject("11111111-1111-1111-1111-111111111111")
        .issuedAt(Instant.parse("2026-01-01T00:00:00Z"))
        .expiresAt(Instant.parse("2026-01-01T01:00:00Z"))
        .claims { it.putAll(claims) }
        .build()

    @Test
    fun `maps realm_access roles to ROLE_-prefixed authorities`() {
        val token = converter.convert(
            jwt(mapOf("realm_access" to mapOf("roles" to listOf("USER", "ADMIN")))),
        )

        assertThat(token.authorities).extracting<String> { it.authority }
            .containsExactlyInAnyOrder("ROLE_USER", "ROLE_ADMIN")
        assertThat(token.principal).isInstanceOf(Jwt::class.java)
    }

    @Test
    fun `missing realm_access claim yields empty authorities`() {
        val token = converter.convert(jwt(emptyMap()))

        assertThat(token.authorities).isEmpty()
    }

    @Test
    fun `realm_access without roles array yields empty authorities`() {
        val token = converter.convert(jwt(mapOf("realm_access" to mapOf("other" to "x"))))

        assertThat(token.authorities).isEmpty()
    }

    @Test
    fun `malformed roles value is tolerated and yields empty authorities`() {
        val token = converter.convert(jwt(mapOf("realm_access" to mapOf("roles" to "not-a-list"))))

        assertThat(token.authorities).isEmpty()
    }

    @Test
    fun `non-string entries in roles are filtered out`() {
        val token = converter.convert(
            jwt(mapOf("realm_access" to mapOf("roles" to listOf("USER", 42, null, "ADMIN")))),
        )

        assertThat(token.authorities).extracting<String> { it.authority }
            .containsExactlyInAnyOrder("ROLE_USER", "ROLE_ADMIN")
    }
}
