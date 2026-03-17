# Frontend Architecture

## Technology Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS

## Design Principles

The frontend must follow these principles:

- modular components
- reusable UI
- separation of concerns
- scalable architecture
- responsive design

## Folder Structure

src/

app/ → Next.js pages and routing  
components/ → reusable UI components  
modules/ → feature-specific components  
services/ → API communication  
hooks/ → reusable hooks  
types/ → TypeScript interfaces  
utils/ → helper functions  

## UI Components

Examples of reusable components:

- Button
- Card
- Modal
- Navbar
- Input
- Grid
- Pagination

## Feature Modules

Examples:

movies/
search/
recommendations/
user/

Each module should contain:

components  
services  
types  
hooks