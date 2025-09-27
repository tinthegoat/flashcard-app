# StudyFlash

StudyFlash is a full-stack web application that helps students create, manage, and practice flashcards. The app is designed to make learning more interactive with user-friendly features, responsive design, and persistent storage using MongoDB.

---

## Members

- Nyunt Tin - https://github.com/tinthegoat/flashcard-app
- Pyae Phyo Nandar Oo
- Phanthira Kositjaroenkul

---

## Description

- **User Authentication**
  - Sign up, log in, and session tokens
  - Update username and password securely

- **Flashcard Sets**
  - Create, rename, and delete sets
  - Each set belongs to a specific user

- **Flashcards**
  - Add, edit, and delete flashcards within sets
  - Flashcards linked to their parent set

- **Practice Mode**
  - Go through flashcards for active recall

- **Leaderboard**
  - Track user performance
  - Compare with other users

- **Navbar**
  - Mobile and desktop responsive dropdown menus

### Tech Stack

- **Frontend**: Next.js 13 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Auth**: Token-based session handling
- **Deployment**: Vercel, and VM

---

## 🚀 Getting Started

### 1. Clone the Repository
```
git clone https://github.com/your-username/studyflash.git
cd studyflash
```

### 2. Install Dependencies
```
pnpm install
```
---

## Notes for Teacher

- **Meets assignment criteria**: user authentication, CRUD functionality, practice mode, responsive UI, persistent DB.
- **Code structure**: split into models, API routes, components, and pages.
- **Models**: Attempt, Flashcard, Set, User

### API Routes

#### User & Authentication
| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/user` | **Sign up**. Creates a new user with `username` and `password`. Returns `username` and session `token`. |
| `GET` | `/api/user` | **Log in**. Authenticates user using `username` and `password` query parameters. Generates and returns a new session `token`. |
| `PATCH` | `/api/user` | **Update user**. Updates user's `username` or `password` (requires `user_id` and `oldPassword` for password change). |