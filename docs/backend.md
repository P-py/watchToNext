# Backend Architecture

## Technology Stack

- Kotlin
- Spring Boot
- PostgreSQL
- Redis
- Keycloak (authentication)

## Backend Structure

The backend follows a layered architecture.

controller/  
Handles HTTP endpoints.

service/  
Contains business logic.

repository/  
Handles persistence.

model/  
Domain models.

dto/  
Data transfer objects.

config/  
Configuration classes.

integration/  
External API integration (TMDB).

## API Style

The backend exposes a REST API.

Example endpoint structure:

/api/movies
/api/movies/{id}
/api/recommendations
/api/users