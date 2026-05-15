package com.watchtonext.api.config

import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component

@Component
class JwtConverter : Converter<Jwt, AbstractAuthenticationToken> {

    override fun convert(jwt: Jwt): AbstractAuthenticationToken =
        JwtAuthenticationToken(jwt, extractAuthorities(jwt))

    private fun extractAuthorities(jwt: Jwt): Collection<GrantedAuthority> {
        val realmAccess = jwt.getClaim<Map<String, Any>>(REALM_ACCESS_CLAIM) ?: return emptyList()
        val roles = realmAccess[ROLES_KEY] as? List<*> ?: return emptyList()
        return roles.mapNotNull { role -> (role as? String)?.let { SimpleGrantedAuthority("$ROLE_PREFIX$it") } }
    }

    private companion object {
        const val REALM_ACCESS_CLAIM = "realm_access"
        const val ROLES_KEY = "roles"
        const val ROLE_PREFIX = "ROLE_"
    }
}
