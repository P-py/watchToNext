package com.watchtonext.api.dto

import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull

data class RateMovieRequest(
    @field:NotNull
    @field:DecimalMin("0.0")
    @field:DecimalMax("5.0")
    val rating: Double?,
)
