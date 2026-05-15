package com.watchtonext.api.controller.advice

import com.watchtonext.api.dto.ApiError
import com.watchtonext.api.dto.ErrorEnum
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.ConstraintViolation
import jakarta.validation.ConstraintViolationException
import jakarta.validation.Path
import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.dao.QueryTimeoutException
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ProblemDetail
import org.springframework.http.ResponseEntity
import org.springframework.web.context.request.WebRequest
import org.springframework.web.server.ResponseStatusException
import java.util.concurrent.TimeoutException

class GlobalExceptionHandlerTest {

    /** Subclass that re-exposes the protected ResponseEntityExceptionHandler hook. */
    private class TestableHandler : GlobalExceptionHandler() {
        public override fun createResponseEntity(
            body: Any?,
            headers: HttpHeaders,
            statusCode: HttpStatusCode,
            request: WebRequest,
        ): ResponseEntity<Any> = super.createResponseEntity(body, headers, statusCode, request)
    }

    private val handler = TestableHandler()

    private fun request(uri: String = "/movies"): HttpServletRequest =
        mockk<HttpServletRequest>().also { every { it.requestURI } returns uri }

    private fun violation(propertyPath: String, message: String): ConstraintViolation<*> {
        val path = mockk<Path>().also { every { it.toString() } returns propertyPath }
        val v = mockk<ConstraintViolation<Any>>()
        every { v.propertyPath } returns path
        every { v.message } returns message
        return v
    }

    private fun body(response: org.springframework.http.ResponseEntity<ApiError>): ApiError =
        response.body ?: error("response body must not be null")

    @Test
    fun `ConstraintViolationException returns 400 with field details and pt-BR copy`() {
        val ex = ConstraintViolationException(
            setOf(
                violation("create.dto.title", "must not be blank"),
                violation("create.dto.rating", "must be between 1 and 5"),
            ),
        )

        val response = handler.handleConstraintViolation(ex)

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
        val payload = body(response)
        assertThat(payload.code).isEqualTo(ErrorEnum.VALIDATION_FAILED)
        assertThat(payload.status).isEqualTo(400)
        assertThat(payload.message).isEqualTo("Alguns campos estão inválidos. Revise e tente novamente.")
        assertThat(payload.details).isNotNull
        assertThat(payload.details!!).extracting<String> { it.field }.containsExactlyInAnyOrder("title", "rating")
        assertThat(payload.details!!).extracting<String> { it.message }
            .containsExactlyInAnyOrder("must not be blank", "must be between 1 and 5")
    }

    @Test
    fun `IllegalArgumentException returns 400 with the canonical pt-BR message`() {
        val response = handler.handleIllegalArgument(IllegalArgumentException("bad input"), request())

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
        val payload = body(response)
        assertThat(payload.code).isEqualTo(ErrorEnum.VALIDATION_FAILED)
        assertThat(payload.message)
            .isEqualTo("Não foi possível processar a requisição. Verifique os valores e tente novamente.")
        // Never echo the original exception message.
        assertThat(payload.message).doesNotContain("bad input")
    }

    @Test
    fun `ResponseStatusException maps status code and uses reason as message`() {
        val ex = ResponseStatusException(HttpStatus.NOT_FOUND, "Filme não encontrado.")

        val response = handler.handleResponseStatus(ex)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
        val payload = body(response)
        assertThat(payload.code).isEqualTo(ErrorEnum.RESOURCE_NOT_FOUND)
        assertThat(payload.status).isEqualTo(404)
        assertThat(payload.message).isEqualTo("Filme não encontrado.")
    }

    @Test
    fun `ResponseStatusException without reason falls back to the status reason phrase`() {
        val ex = ResponseStatusException(HttpStatus.CONFLICT)

        val response = handler.handleResponseStatus(ex)

        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
        val payload = body(response)
        assertThat(payload.code).isEqualTo(ErrorEnum.RESOURCE_CONFLICT)
        // ResponseStatusException default reason is the status reason phrase ("Conflict").
        assertThat(payload.message).isNotBlank
    }

    @Test
    fun `DataIntegrityViolationException returns 409 without leaking SQL or cause`() {
        val ex = DataIntegrityViolationException("duplicate key value violates unique constraint movie_pkey")

        val response = handler.handleDataIntegrity(ex, request())

        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
        val payload = body(response)
        assertThat(payload.code).isEqualTo(ErrorEnum.RESOURCE_CONFLICT)
        assertThat(payload.status).isEqualTo(409)
        assertThat(payload.message).isEqualTo("Essa ação conflita com dados existentes.")
        assertThat(payload.message).doesNotContain("constraint", "duplicate")
    }

    @Test
    fun `QueryTimeoutException returns 504 with the canonical pt-BR message`() {
        val response = handler.handleTimeout(QueryTimeoutException("slow query"), request())

        assertThat(response.statusCode).isEqualTo(HttpStatus.GATEWAY_TIMEOUT)
        val payload = body(response)
        assertThat(payload.code).isEqualTo(ErrorEnum.UPSTREAM_TIMEOUT)
        assertThat(payload.message)
            .isEqualTo("O servidor demorou muito para responder. Tente novamente em instantes.")
    }

    @Test
    fun `java util concurrent TimeoutException also maps to 504`() {
        val response = handler.handleTimeout(TimeoutException("upstream"), request())

        assertThat(response.statusCode).isEqualTo(HttpStatus.GATEWAY_TIMEOUT)
        assertThat(body(response).code).isEqualTo(ErrorEnum.UPSTREAM_TIMEOUT)
    }

    @Test
    fun `generic Exception returns 500 with the canonical pt-BR message`() {
        val response = handler.handleUnexpected(RuntimeException("npe somewhere deep"), request())

        assertThat(response.statusCode).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR)
        val payload = body(response)
        assertThat(payload.code).isEqualTo(ErrorEnum.INTERNAL_ERROR)
        assertThat(payload.status).isEqualTo(500)
        assertThat(payload.message).isEqualTo("Algo deu errado do nosso lado. Tente novamente em instantes.")
        assertThat(payload.message).doesNotContain("npe")
    }

    @Test
    fun `createResponseEntity rewrites ProblemDetail body into ApiError`() {
        val problem = ProblemDetail.forStatus(HttpStatus.METHOD_NOT_ALLOWED).apply {
            detail = "Method 'POST' is not supported."
        }

        val response = handler.createResponseEntity(
            problem,
            HttpHeaders(),
            HttpStatus.METHOD_NOT_ALLOWED,
            mockk<WebRequest>(),
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED)
        val payload = response.body as ApiError
        assertThat(payload.code).isEqualTo(ErrorEnum.METHOD_NOT_ALLOWED)
        assertThat(payload.status).isEqualTo(405)
        assertThat(payload.message).isEqualTo("Method 'POST' is not supported.")
    }

    @Test
    fun `createResponseEntity without a ProblemDetail body falls back to the status reason phrase`() {
        val response = handler.createResponseEntity(
            null,
            HttpHeaders(),
            HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            mockk<WebRequest>(),
        )

        val payload = response.body as ApiError
        assertThat(payload.code).isEqualTo(ErrorEnum.UNSUPPORTED_MEDIA_TYPE)
        assertThat(payload.message).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE.reasonPhrase)
    }
}
