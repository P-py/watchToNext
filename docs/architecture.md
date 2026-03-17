# System Architecture

## Architectural Style

The system follows a modular architecture with separation between:

- Presentation Layer (Frontend)
- Application Layer (Backend services)
- Data Layer (Database)
- Infrastructure Layer

## Frontend Architecture

The frontend is built using Next.js with a modular component architecture.

Key principles:

- Reusable UI components
- Separation of UI and business logic
- Service layer for API communication
- Feature-based module organization

Example structure:

src/

components/ → reusable UI components  
modules/ → feature modules (movies, search, recommendations)  
services/ → API communication layer  
hooks/ → reusable logic  
types/ → TypeScript types  
utils/ → utility functions  

## Backend Architecture

The backend is built using Kotlin and Spring Boot following a layered architecture.

Layers:

Controller Layer  
Handles HTTP requests.

Service Layer  
Contains business logic.

Repository Layer  
Handles database operations.

Integration Layer  
Handles external APIs such as TMDB.

## External Integrations

TMDB API

Used for retrieving:

- movie metadata
- genres
- ratings
- movie descriptions