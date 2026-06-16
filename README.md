# AskTheCompiler — Developer Q&A Platform

> A Developer Q&A platform built for competitive programmers, DSA enthusiasts, and developers — ask, answer, and grow the CP/Dev community.

---

## What it does

AskTheCompiler is a **technical-only** Q&A platform — it filters out non-programming questions at the door, supports rich Markdown + syntax-highlighted code, drag-and-drop image uploads, one-level tagged replies, direct messaging, and a reputation system.

- **Ask** in Markdown with code blocks, images, and 1–5 tech tags
- **Answer** in Markdown with full syntax highlighting (JS, Python, C++, Java, C, HTML, CSS)
- **Vote**, **accept** answers, and **reply** directly to a specific answer
- **Message** other users (DMs auto-expire after 24h)
- **Earn reputation** as your contributions get upvoted

## Core Functionality

### Basic Features
- **Q&A flow** — create, browse, search, and filter questions by tag
- **Markdown editor** with syntax highlighting for 7 languages (JS, Python, C++, Java, C, HTML, CSS)
- **Voting & accepted answers** — upvote/downvote questions and answers; question authors can mark the accepted answer
- **Tagging system** — 1–5 tech tags per question from a curated list of 50+ technologies
- **On-topic moderation** — keyword-based filter that blocks non-programming questions
- **Image uploads** — drag-and-drop or paste images directly into the editor (Cloudinary)

### User Experience
- **Dark-themed UI** built with Tailwind, designed for long reading sessions
- **Search & sort** — full-text search across questions, sort by newest, votes, or unanswered
- **One-level tagged replies** — reply directly to a specific answer with auto-tagged `@username`
- **Direct messaging** — 1-on-1 DMs with 24-hour auto-expiry
- **Protected routes** — auth state managed globally with Zustand, auto-redirect on session expiry

### Authentication & Security
- **JWT in `httpOnly` cookies** with `sameSite: 'strict'` and `secure` in production
- **bcrypt** password hashing (salt rounds 12)
- **Login rate-limiting** — 10 attempts per 15 minutes per IP
- **XSS protection** — all user content rendered through `rehype-sanitize`
- **Reputation system** — users earn reputation as their content gets upvoted

### Performance & Reliability
- **MongoDB indexes** on text fields, tags, author, and timestamps for fast queries
- **Vite dev proxy** — `/api` requests are seamlessly forwarded to the backend
- **Concurrent dev startup** — `concurrently` runs client and server with a single command
- **Auto-expiring messages** — TTL index keeps the messages collection clean

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing / State | React Router v6, Zustand |
| Markdown / Code | `@uiw/react-md-editor`, CodeMirror, `react-markdown` + `highlight.js` |
| Backend | Node.js + Express 5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT in `httpOnly` cookies + bcrypt |
| Uploads | Multer + Cloudinary |
| Dev orchestration | `concurrently` |

---

## Architecture

```
Browser
  ↓
React + Vite (port 5173)        serves the SPA, proxies /api → :5000
  ↓
Express 5 (port 5000)           REST API, JWT-cookie auth, CORS, rate-limit
  ↓
Controllers  →  Services        thin HTTP layer + business logic
  ↓
Mongoose models                 User, Question, Answer, Message
  ↓
MongoDB                         text + tag + author indexed lookups
  ↓
Cloudinary                      image uploads for Markdown posts
```

---


## Project Structure

```
AskTheCompiler/
├── client/                              # React + Vite frontend
│   ├── src/
│   │   ├── api/axios.js                 # axios instance, /api proxy, 401 handler
│   │   ├── store/authStore.js           # Zustand auth state
│   │   ├── data/techTags.js             # 50+ allowed tech tags
│   │   ├── components/
│   │   │   ├── editor/
│   │   │   │   ├── MarkdownEditor.jsx   # @uiw/react-md-editor + paste/drop uploads
│   │   │   │   └── CodeInsertModal.jsx  # CodeMirror with language picker
│   │   │   ├── renderer/
│   │   │   │   └── MarkdownRenderer.jsx # react-markdown + sanitize + highlight
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx           # logo, search, login/logout
│   │   │       └── Sidebar.jsx          # trending tags / nav
│   │   ├── pages/
│   │   │   ├── HomePage.jsx             # question feed (search/tag/sort/paginate)
│   │   │   ├── QuestionDetailPage.jsx   # question + answers + reply form
│   │   │   ├── AskQuestionPage.jsx      # title/body/tags editor
│   │   │   ├── LoginPage.jsx            # email + password
│   │   │   ├── RegisterPage.jsx         # username + email + password
│   │   │   ├── ProfilePage.jsx          # user info, reputation, questions
│   │   │   ├── InboxPage.jsx            # DM list
│   │   │   └── ConversationPage.jsx     # 1-on-1 chat
│   │   ├── App.jsx                      # routes + protected routes
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js                   # dev proxy /api → :5000
│   ├── tailwind.config.js
│   └── package.json
├── server/                              # Express API
│   ├── config/
│   │   ├── db.js                        # Mongoose connection
│   │   └── cloudinary.js                # Cloudinary config
│   ├── models/
│   │   ├── User.models.js               # username, email, password (bcrypt), bio, reputation
│   │   ├── Question.models.js           # title, body, tags, votes, views, acceptedAnswer
│   │   ├── Answer.models.js             # body, author, votes, isAccepted, replyTo
│   │   └── Message.models.js            # sender, recipient, content, TTL 24h
│   ├── routes/
│   │   ├── auth.routes.js               # /register /login /logout /me (rate-limited)
│   │   ├── question.routes.js           # CRUD + vote
│   │   ├── answer.routes.js             # CRUD + vote + accept + reply
│   │   ├── upload.routes.js             # POST /upload (image)
│   │   ├── user.routes.js               # GET /:id, DELETE /me
│   │   └── message.routes.js            # inbox + conversations
│   ├── controllers/                     # thin HTTP handlers
│   ├── services/                        # business logic
│   │   ├── auth.service.js
│   │   ├── question.service.js
│   │   ├── answer.service.js
│   │   ├── message.service.js
│   │   ├── upload.service.js
│   │   ├── user.service.js
│   │   └── moderation.service.js        # on-topic keyword filter
│   ├── middlewares/
│   │   ├── auth.middleware.js           # JWT verify + attach req.user
│   │   └── error.middleware.js          # ApiError + Mongoose error shaping
│   ├── utils/
│   │   ├── jwt.utils.js                 # sign + verify
│   │   └── ApiError.js                  # typed HTTP error
│   └── server.js                        # express bootstrap
├── .env.example
├── package.json                         # root scripts (concurrently)
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas) free tier)
- [Cloudinary](https://cloudinary.com) account (free) — for image uploads

### 1. Clone & install

```bash
git clone https://github.com/ace-suyash/AskTheCompiler.git
cd AskTheCompiler
npm run install:all
```

### 2. Configure environment

Create `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/askthecompiler
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run

```bash
npm run dev
```

This starts both the client (`:5173`) and server (`:5000`). Vite proxies `/api` requests to the backend.

Open `http://localhost:5173`.

---

## Requirements

Server (`server/package.json`):
```
bcryptjs
cloudinary
cookie-parser
cors
dotenv
express
express-rate-limit
express-validator
jsonwebtoken
mongoose
morgan
multer
multer-storage-cloudinary
```

Client (`client/package.json`):
```
react
react-dom
react-router-dom
axios
zustand
@uiw/react-md-editor
@uiw/react-codemirror
@codemirror/lang-javascript
@codemirror/lang-python
@codemirror/lang-cpp
@codemirror/lang-java
@codemirror/lang-css
@codemirror/lang-html
react-markdown
rehype-highlight
rehype-sanitize
remark-gfm
highlight.js
```

Root:
```
concurrently
```

