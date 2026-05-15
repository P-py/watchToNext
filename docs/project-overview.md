# WatchToNext – Project Overview

> **Academic project — temporary, non-commercial.** Not a production service and not affiliated with any movie studio, streaming provider, or TMDB. See the [README](../README.md) for the full disclaimer.

## Project Description

WatchToNext is a movie recommendation platform designed to help users discover new movies based on similarity analysis.

The system uses the K-Nearest Neighbors (KNN) algorithm to recommend movies that are similar to others previously selected or viewed by the user.

Movie metadata (titles, overviews, genres, ratings, poster paths) comes from the Full TMDB Movies Dataset on Kaggle, imported once into the database by the seeder. The backend makes no live external API calls after that; the only runtime external fetch is the browser loading poster images from TMDB's image CDN.

The main objective of the platform is to provide more relevant movie suggestions compared to generic ranking-based recommendation systems.

## Core Features

- Public catalog browsing and title search
- Movie details visualization
- Similar-movie recommendations (KNN)
- Favorites, ratings, and watched history — each with its own list page
- Authenticated suggestions page — quick (full history), seed-picked movies, or by genre
- User profile with list summaries
- Keycloak-backed sign-up / login

## Recommendation Flow

```mermaid
flowchart LR
  A(["User selects\na movie"]) --> B["Extract\nfeature vector\n(genres · vote avg · vote count · popularity)"]
  B --> C["KNN search\n(cosine similarity)"]
  C --> D["Return K\nnearest neighbors"]
  D --> E(["Display\nrecommendations"])
```

## System Architecture

The system follows a distributed architecture composed of:

```mermaid
graph TD
  Frontend["Frontend + BFF\nNext.js · TypeScript · TailwindCSS"]
  Backend["Backend\nKotlin · Spring Boot · REST API"]
  Data["Data Layer\nPostgreSQL · Redis"]
  Auth["Authentication\nKeycloak · OAuth2 / OIDC"]
  Seed["Kaggle TMDB dataset\n(one-time offline seed)"]

  Frontend <-->|REST via BFF proxy| Backend
  Backend <--> Data
  Frontend <-->|OAuth2 / OIDC| Auth
  Backend <-->|Token validation| Auth
  Seed -.->|seeded once| Data
```
