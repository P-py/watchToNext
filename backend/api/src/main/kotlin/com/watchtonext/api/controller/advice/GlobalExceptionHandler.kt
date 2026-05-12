package com.watchtonext.api.controller.advice

import com.watchtonext.api.dto.ApiError
import com.watchtonext.api.dto.ErrorEnum
import com.watchtonext.api.dto.FieldError
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.dao.QueryTimeoutException
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ProblemDetail
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest
import org.springframework.web.context.request.async.AsyncRequestTimeoutException
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler
import java.util.concurrent.TimeoutException

@RestControllerAdvice
class GlobalExceptionHandler : ResponseEntityExceptionHandler() {

    private val log = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(ex: ConstraintViolationException): ResponseEntity<ApiError> {
        val details = ex.constraintViolations.map { violation ->
            FieldError(
                field = violation.propertyPath.toString().substringAfterLast('.'),
                message = violation.message,
            )
        }
        return build(ErrorEnum.VALIDATION_FAILED, "Validation failed", details)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(ex: IllegalArgumentException, request: HttpServletRequest): ResponseEntity<ApiError> {
        log.warn("IllegalArgumentException on {}: {}", request.requestURI, ex.message)
        return build(ErrorEnum.VALIDATION_FAILED, "invalid argument")
    }

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatus(ex: ResponseStatusException): ResponseEntity<ApiError> {
        val status = HttpStatus.valueOf(ex.statusCode.value())
        val code = ErrorEnum.fromStatus(status)
        return build(code, ex.reason ?: status.reasonPhrase)
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrity(ex: DataIntegrityViolationException, request: HttpServletRequest): ResponseEntity<ApiError> {
        log.warn("Data integrity violation on {}: {}", request.requestURI, ex.mostSpecificCause.message)
        return build(ErrorEnum.RESOURCE_CONFLICT, "resource conflict")
    }

    @ExceptionHandler(QueryTimeoutException::class, AsyncRequestTimeoutException::class, TimeoutException::class)
    fun handleTimeout(ex: Exception, request: HttpServletRequest): ResponseEntity<ApiError> {
        log.warn("Timeout on {}: {}", request.requestURI, ex.message)
        return build(ErrorEnum.UPSTREAM_TIMEOUT, "upstream timeout")
    }

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(ex: Exception, request: HttpServletRequest): ResponseEntity<ApiError> {
        log.error("Unhandled exception on {}", request.requestURI, ex)
        return build(ErrorEnum.INTERNAL_ERROR, "Internal server error")
    }

    /**
     * Normalizes the body of every exception handled by [ResponseEntityExceptionHandler]
     * (method not allowed, unsupported media type, no handler found, malformed body,
     * missing param, type mismatch, bean-validation on @RequestBody, etc.) into [ApiError].
     */
    override fun createResponseEntity(
        body: Any?,
        headers: HttpHeaders,
        statusCode: HttpStatusCode,
        request: WebRequest,
    ): ResponseEntity<Any> {
        val status = HttpStatus.valueOf(statusCode.value())
        val code = ErrorEnum.fromStatus(status)
        val message = (body as? ProblemDetail)?.detail ?: status.reasonPhrase
        val apiError = ApiError(
            code = code,
            message = message,
            status = status.value(),
        )
        return ResponseEntity.status(status).headers(headers).body(apiError)
    }

    private fun build(
        code: ErrorEnum,
        message: String,
        details: List<FieldError>? = null,
    ): ResponseEntity<ApiError> =
        ResponseEntity.status(code.status).body(
            ApiError(
                code = code,
                message = message,
                status = code.status.value(),
                details = details,
            ),
        )
}
