# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KeciApp is a Turkish language content management and learning platform ("keciyibesle" means "feed the goat"). It features podcast series/episodes, articles, daily/weekly content, aphorisms, affirmations, and user progress tracking.

## Tech Stack

- **Backend**: .NET 9 Web API with Entity Framework Core (PostgreSQL via Npgsql)
- **Frontend**: React 18 + TypeScript + Vite
- **Authentication**: JWT Bearer tokens with BCrypt password hashing
- **Styling**: Bootstrap 5 + SASS

## Development Commands

### Frontend (from `frontend/` directory)
```bash
npm run dev          # Start Vite dev server (default: http://localhost:5173)
npm run build        # TypeScript compile + Vite build
npm run lint         # ESLint
npm run format       # Prettier formatting
npm run preview      # Preview production build
```

### Backend (from `KeciApp.API/` directory)
```bash
dotnet run           # Run the API (development)
dotnet build         # Build the project
dotnet ef migrations add <name>   # Add EF migration
dotnet ef database update         # Apply migrations
```

## Architecture

### Backend Structure (`KeciApp.API/`)
- **Controllers/**: REST API endpoints (e.g., `AuthController`, `EpisodesController`)
- **Services/**: Business logic layer with interfaces in `Interfaces/`
- **Repositories/**: Data access layer using generic repository pattern
- **Models/**: Entity definitions (e.g., `User`, `PodcastSeries`, `DailyContent`)
- **DTOs/**: Data transfer objects for API requests/responses
- **Mappings/**: AutoMapper profiles
- **Data/**: `AppDbContext` Entity Framework context

Service registration pattern in `Program.cs`:
- All repositories implement `IGenericRepository<T>` or specific interfaces
- Services are registered with scoped lifetime
- JWT configuration with 2-day inactivity timeout (30 days with "Remember Me")

### Frontend Structure (`frontend/src/`)
- **app/**: Page components organized by role:
  - `(admin)/`: Admin dashboard, content management, user management
  - `(user)/`: User-facing pages (podcasts, favorites, notes, questions)
  - `(other)/`: Auth pages, error pages
- **services/**: API service layer (typed API calls via axios wrapper)
- **context/**: React contexts (`AuthContext`, `LayoutContext`)
- **lib/axios.ts**: Centralized axios instance with auth interceptors
- **routes/index.tsx**: Route definitions with lazy loading
- **components/**: Reusable UI components
- **types/**: TypeScript type definitions

### API Communication
- Base URL configured in `lib/axios.ts` (environment variable: `VITE_API_BASE_URL`)
- Default: `https://app.keciyibesle.com/api` (production) or `http://localhost:5294/api` (local)
- JWT token stored in localStorage (`authToken`) and cookies
- Auto-logout on 401 responses

### Key Patterns
- Path alias: `@/` maps to `frontend/src/`
- Services export from `services/index.ts`
- Forms use `react-hook-form` with `yup` validation
- Toast notifications via `react-toastify`

## Domain Concepts

- **Podcast Series/Episodes**: Audio content with user progress tracking
- **Daily Content**: Content assigned per user on a daily basis (for users with `dailyOrWeekly=true`)
- **Weekly Content**: Weekly assignments including music, movies, tasks, questions
- **User Series Access**: Controls which podcast series users can access
- **User Progress**: Tracks completion of daily content and episodes

## Configuration

### Backend
- Connection string: `appsettings.json` → `ConnectionStrings:DefaultConnection`
- JWT settings: `appsettings.json` → `Jwt:SecretKey`, `Jwt:Issuer`, `Jwt:Audience`
- Audio storage: `wwwroot/audio/`

### Frontend
- Environment: `VITE_API_BASE_URL` for API endpoint
