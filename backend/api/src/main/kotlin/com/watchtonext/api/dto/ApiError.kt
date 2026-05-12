package com.watchtonext.api.dto

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ApiError(
    val code: ErrorEnum,
    val message: String,
    val status: Int,
    val details: List<FieldError>? = null,
)
