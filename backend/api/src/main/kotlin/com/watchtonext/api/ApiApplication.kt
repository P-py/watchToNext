package com.watchtonext.api

import com.watchtonext.api.config.CorsProperties
import com.watchtonext.api.config.RecommenderProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(RecommenderProperties::class, CorsProperties::class)
class ApiApplication

fun main(args: Array<String>) {
	runApplication<ApiApplication>(*args)
}
