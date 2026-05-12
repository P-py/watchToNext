package com.watchtonext.api.dto

import org.springframework.http.HttpStatus

enum class ErrorEnum(val status: HttpStatus) {
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED),
    NOT_ACCEPTABLE(HttpStatus.NOT_ACCEPTABLE),
    RESOURCE_CONFLICT(HttpStatus.CONFLICT),
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    UPSTREAM_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR),
    ;

    companion object {
        fun fromStatus(status: HttpStatus): ErrorEnum = when (status) {
            HttpStatus.BAD_REQUEST -> VALIDATION_FAILED
            HttpStatus.NOT_FOUND -> RESOURCE_NOT_FOUND
            HttpStatus.METHOD_NOT_ALLOWED -> METHOD_NOT_ALLOWED
            HttpStatus.NOT_ACCEPTABLE -> NOT_ACCEPTABLE
            HttpStatus.CONFLICT -> RESOURCE_CONFLICT
            HttpStatus.UNSUPPORTED_MEDIA_TYPE -> UNSUPPORTED_MEDIA_TYPE
            HttpStatus.GATEWAY_TIMEOUT -> UPSTREAM_TIMEOUT
            else -> INTERNAL_ERROR
        }
    }
}
