package com.watchtonext.api.dto

import org.springframework.data.domain.Page

/**
 * Lean paginated wrapper exposed to clients. Converts Spring Data's 0-indexed
 * [Page.getNumber] to a 1-indexed [currentPage] so the HTTP contract matches
 * "page 1, page 2…" the way users (and the frontend `Pagination` component) think.
 *
 * Maps via [from] to avoid leaking Spring's `pageable`/`sort`/`first`/`last`
 * payload into the JSON.
 */
data class PageDto<T : Any>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val currentPage: Int,
    val pageSize: Int,
) {
    companion object {
        fun <T : Any> from(page: Page<T>) = PageDto(
            content = page.content,
            totalElements = page.totalElements,
            totalPages = page.totalPages,
            currentPage = page.number + 1,
            pageSize = page.size,
        )
    }
}
