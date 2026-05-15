package com.watchtonext.api.controller

import com.watchtonext.api.dto.UserMeDto
import com.watchtonext.api.service.UserService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/users")
class UserController(private val service: UserService) {

    @GetMapping("/me")
    fun me(@AuthenticationPrincipal jwt: Jwt): UserMeDto = service.getMe(jwt)
}
