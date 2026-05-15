# syntax=docker/dockerfile:1
# watchToNext API — Kotlin / Spring Boot (Gradle multi-module).
# Build context: the `backend/` directory.

# ---- build stage ---------------------------------------------------------
# JDK 24 — the Kotlin convention plugin pins `jvmToolchain(24)`.
FROM eclipse-temurin:24-jdk AS build
WORKDIR /app

# Copy the whole Gradle project (settings, buildSrc, :api, :engine, wrapper).
COPY . .

# Produce the Spring Boot fat jar for the :api module. No daemon in CI/containers.
RUN ./gradlew :api:bootJar --no-daemon -x test

# ---- runtime stage -------------------------------------------------------
FROM eclipse-temurin:24-jre AS run
WORKDIR /app

COPY --from=build /app/api/build/libs/*.jar app.jar

# Spring binds `server.port` → ${PORT:8080}; Railway injects PORT.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
