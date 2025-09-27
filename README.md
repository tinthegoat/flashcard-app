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

### User
- `POST /api/user` → Sign up
- `GET /api/user` → Log in
- `PATCH /api/user` → Update username/password

### Sets
- `POST /api/sets` → Create a new set
- `GET /api/sets?user_id={username}` → Get all sets for user
- `PATCH /api/sets/:id` → Rename set
- `DELETE /api/sets/:id` → Delete set

### Flashcards
- `POST /api/flashcards` → Add flashcard to set
- `GET /api/flashcards?set_id={id}` → Get flashcards for a set
- `PATCH /api/flashcards/:id` → Update flashcard
- `DELETE /api/flashcards/:id` → Delete flashcard
