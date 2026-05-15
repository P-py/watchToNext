package com.watchtonext.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateUserMeRequest(
    @field:NotBlank
    @field:Size(min = 1, max = 255)
    val displayName: String?,
)
