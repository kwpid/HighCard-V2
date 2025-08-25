# Overview

HighCard is a competitive single-player card game featuring casual and ranked gameplay modes against AI opponents. Players engage in strategic card battles across multiple game types (1v1 and 2v2) using a combination of regular playing cards and powerful Power-Up cards. The game includes a comprehensive ranking system with seasonal rewards, MMR-based matchmaking, and detailed player statistics tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a React-based Single Page Application (SPA) architecture with TypeScript. The frontend is built with Vite as the build tool and uses Tailwind CSS for styling with Radix UI components for consistent design patterns. The application follows a component-based architecture with separate screens for menu navigation, queue management, and gameplay.

State management is handled through Zustand stores, providing lightweight and efficient state management for game state, player data, and audio controls. The stores are organized by domain (game, player, audio) and use subscribeWithSelector middleware for reactive updates.

## Backend Architecture
The backend follows a minimal Express.js server architecture configured for both development and production environments. The server uses a modular routing system with dedicated route handlers and implements a storage abstraction layer through an IStorage interface.

Currently using an in-memory storage implementation (MemStorage) for development, with the architecture designed to easily swap to a persistent database solution. The backend includes error handling middleware and request/response logging for API monitoring.

## Game Logic Architecture
The game logic is implemented client-side with separate modules for:
- Core game mechanics (card generation, round resolution, scoring)
- AI opponent logic with configurable personalities and difficulty levels
- Ranking system with MMR calculations and seasonal progression
- Queue simulation with realistic wait times based on player skill level

The AI system supports multiple personality types (aggressive, conservative, adaptive, random) with difficulty scaling based on MMR ratings.

## Data Storage Solutions
The application uses a hybrid storage approach:
- **Local Storage**: Player statistics, game settings, and seasonal progress are persisted in browser localStorage for immediate access and offline capability
- **Database Ready**: Drizzle ORM is configured with PostgreSQL schema definitions for future server-side data persistence
- **In-Memory**: Current server implementation uses in-memory storage for development simplicity

The database schema includes user management tables with the foundation for extending to game history, leaderboards, and matchmaking data.

## Authentication and Authorization
Currently implements a basic user system with username/password authentication schema defined in the database layer. The authentication system is prepared for expansion but not yet fully implemented in the current build.

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18 with TypeScript, React DOM, and Vite for development
- **UI Framework**: Radix UI component library for accessible, customizable components
- **Styling**: Tailwind CSS with PostCSS for utility-first styling approach
- **State Management**: Zustand for lightweight, flexible state management
- **3D Graphics**: React Three Fiber and Drei for potential future 3D card animations and effects
- **Data Fetching**: TanStack React Query for server state management and caching
- **Fonts**: Inter font family via Fontsource for consistent typography

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM configured for PostgreSQL with Neon Database serverless driver
- **Development Tools**: tsx for TypeScript execution, esbuild for production builds
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Development Tools
- **Build System**: Vite with React plugin and runtime error overlay for development
- **Database Management**: Drizzle Kit for schema migrations and database operations
- **Shader Support**: vite-plugin-glsl for GLSL shader support in 3D components
- **Code Quality**: TypeScript with strict configuration for type safety

The architecture is designed for scalability, with clear separation between game logic, UI components, and data management. The modular structure allows for easy feature additions and maintenance while maintaining performance through efficient state management and optimized rendering.