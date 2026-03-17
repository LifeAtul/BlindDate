# Startup Idea Validator (IdeaVault) - Backend Architecture Documentation

## Overview
The backend for the **Startup Idea Validator** is built using a modern, scalable, and lightweight stack designed specifically to meet the robust requirements of Round 2, ensuring that data is persistent, user actions are authenticated, and idea lifecycles (like visibility and expiry) are automated.

## Technology Stack
- **Server:** Node.js with Express.js
- **Database:** SQLite (file-based persistent storage, ensuring data remains after restarts)
- **ORM:** Prisma (Next-generation ORM for type-safe database access and easy schema management)
- **Authentication:** JSON Web Tokens (JWT) & `bcryptjs` for secure password hashing

---

## Architectural Decisions & Implementations

### 1. Database & Persistence (Prisma + SQLite)
To satisfy the persistent storage requirement, we migrated from an in-memory array to a SQLite database managed by Prisma.
- **Why SQLite?** It provides full relational database features (perfect for joining Users to Ideas and Upvotes) without the overhead of setting up a separate database server (e.g., PostgreSQL), making it ideal and reliable for a hackathon environment.
- **Why Prisma?** Prisma allowed us to define a clear, readable schema (`schema.prisma`) for `User`, `Idea`, and `Upvote` models, and provides an auto-generated client to interact with the database efficiently.

### 2. Authentication System (JWT)
Security and ownership were implemented using a token-based approach.
- **Hashing:** User passwords are encrypted using `bcryptjs` before entering the database.
- **Sessions:** Upon successful login or registration, the server signs a short-lived **JSON Web Token (JWT)** containing the `userId`. The frontend stores this token and attaches it as a `Bearer` token in the `Authorization` header for protected routes (Creating an idea, Editing, Upvoting). 
- Every idea is strictly linked to a `User` via an `authorId` foreign key.

### 3. Business Logic & Requirements

#### Idea Expiry & Visibility
- The database schema includes a `status` field (`ACTIVE`, `HIDDEN`, `ARCHIVED`) and an optional `expiresAt` `DateTime` field.
- **Automated Archiving:** Instead of running a heavy CRON job, the backend uses a "Lazy Evaluation" strategy. Whenever the `/api/ideas` endpoint is hit to fetch the public dashboard, the server first runs a Prisma `updateMany` command. It checks for any idea where the current `Date.now()` is greater than `expiresAt`, and instantly flips their status to `ARCHIVED`.
- Authors can manually flip their idea's status between `ACTIVE` and `HIDDEN` via the edit endpoint.

#### Activity Tracking (Views & Upvotes)
- **Views:** Clicking an idea on the frontend fires a fire-and-forget `POST /api/ideas/:id/view` request. The database executes an atomic `increment: 1` operation on the `viewCount` column.
- **Upvotes:** Upvotes are strictly tracked via a junction table `Upvote` (linking `userId` and `ideaId`). The `PATCH /api/ideas/:id/upvote` route checks if the user has already upvoted; if so, it deletes the record (undo upvote), otherwise it creates it.

#### Ranking Algorithm
The `GET /api/trending` route implements the exact ranking formula required by the prompt:
`Idea Score = (Market Potential × 2) + Difficulty Score + Upvotes`

The backend reads all active ideas, maps the market potential strings (`Low`, `Medium`, etc.) to their numeric weights, calculates the absolute score using the formula, and sorts them before returning the top 5 to the client.

#### Timestamps
Prisma natively handles `@default(now())` for `createdAt` and the `@updatedAt` directive to automatically bump the timestamp whenever an idea record is edited or upvoted, easily satisfying the tracking requirement.
