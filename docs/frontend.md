# Frontend Architecture

## Technology Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- framer-motion (animations)

## Typography

- **Body font:** DM Sans — warm, rounded, comfortable for dark backgrounds
- **Mono font:** DM Mono — matched to DM Sans for code and labels
- Base `line-height: 1.65`, `letter-spacing: 0.01em` for comfortable body reading
- Headings use `letter-spacing: -0.02em` and `font-weight: 600`
- Never override the font stack inline — all font settings flow from `globals.css` and the CSS variables `--font-dm-sans` / `--font-dm-mono`

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