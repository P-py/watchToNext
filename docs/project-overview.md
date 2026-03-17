# WatchToNext – Project Overview

## Project Description

WatchToNext is a movie recommendation platform designed to help users discover new movies based on similarity analysis.

The system uses the K-Nearest Neighbors (KNN) algorithm to recommend movies that are similar to others previously selected or viewed by the user.

The platform integrates with the TMDB (The Movie Database) API to retrieve detailed information about movies, including metadata such as genres, ratings, cast, and descriptions.

The main objective of the platform is to provide more relevant movie suggestions compared to generic ranking-based recommendation systems.

## Core Features

- Movie search
- Movie details visualization
- Similar movie recommendations
- Genre browsing
- User profile
- Personalized recommendations
- Movie discovery interface

## System Architecture

The system follows a distributed architecture composed of:

Frontend:
- Next.js
- TypeScript
- TailwindCSS

Backend:
- Kotlin
- Spring Boot
- REST API

Data Layer:
- PostgreSQL
- Redis (cache)

Authentication:
- Keycloak
- OAuth2 / OpenID Connect

External Services:
- TMDB API