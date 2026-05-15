package com.watchtonext.api.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

class ErrorEnumTest {

    @Test
    fun `every enum value pins its canonical HTTP status`() {
        assertThat(ErrorEnum.VALIDATION_FAILED.status).isEqualTo(HttpStatus.BAD_REQUEST)
        assertThat(ErrorEnum.RESOURCE_NOT_FOUND.status).isEqualTo(HttpStatus.NOT_FOUND)
        assertThat(ErrorEnum.METHOD_NOT_ALLOWED.status).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED)
        assertThat(ErrorEnum.NOT_ACCEPTABLE.status).isEqualTo(HttpStatus.NOT_ACCEPTABLE)
        assertThat(ErrorEnum.RESOURCE_CONFLICT.status).isEqualTo(HttpStatus.CONFLICT)
        assertThat(ErrorEnum.UNSUPPORTED_MEDIA_TYPE.status).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        assertThat(ErrorEnum.UPSTREAM_TIMEOUT.status).isEqualTo(HttpStatus.GATEWAY_TIMEOUT)
        assertThat(ErrorEnum.SERVICE_UNAVAILABLE.status).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
        assertThat(ErrorEnum.INTERNAL_ERROR.status).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @Test
    fun `fromStatus maps each known HTTP status to the right enum`() {
        assertThat(ErrorEnum.fromStatus(HttpStatus.BAD_REQUEST)).isEqualTo(ErrorEnum.VALIDATION_FAILED)
        assertThat(ErrorEnum.fromStatus(HttpStatus.NOT_FOUND)).isEqualTo(ErrorEnum.RESOURCE_NOT_FOUND)
        assertThat(ErrorEnum.fromStatus(HttpStatus.METHOD_NOT_ALLOWED)).isEqualTo(ErrorEnum.METHOD_NOT_ALLOWED)
        assertThat(ErrorEnum.fromStatus(HttpStatus.NOT_ACCEPTABLE)).isEqualTo(ErrorEnum.NOT_ACCEPTABLE)
        assertThat(ErrorEnum.fromStatus(HttpStatus.CONFLICT)).isEqualTo(ErrorEnum.RESOURCE_CONFLICT)
        assertThat(ErrorEnum.fromStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)).isEqualTo(ErrorEnum.UNSUPPORTED_MEDIA_TYPE)
        assertThat(ErrorEnum.fromStatus(HttpStatus.GATEWAY_TIMEOUT)).isEqualTo(ErrorEnum.UPSTREAM_TIMEOUT)
        assertThat(ErrorEnum.fromStatus(HttpStatus.SERVICE_UNAVAILABLE)).isEqualTo(ErrorEnum.SERVICE_UNAVAILABLE)
    }

    @Test
    fun `fromStatus falls back to INTERNAL_ERROR for unmapped statuses`() {
        assertThat(ErrorEnum.fromStatus(HttpStatus.PAYMENT_REQUIRED)).isEqualTo(ErrorEnum.INTERNAL_ERROR)
        assertThat(ErrorEnum.fromStatus(HttpStatus.INTERNAL_SERVER_ERROR)).isEqualTo(ErrorEnum.INTERNAL_ERROR)
    }
}
