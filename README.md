# UI CSC Portal (Elite 30 Portal)

A student and admin portal for the University of Ibadan Computer Science department. Students get their courses, lecture notes, materials, assignments, syllabus and announcements in one place, plus an AI study assistant that knows what is actually on the portal. Admins manage all of that content, the student roster and other admins from a separate permission-controlled dashboard.

The web app is plain HTML/CSS/JavaScript served by a Node.js + Express backend. It can also be wrapped as an Android app with Capacitor (push notifications and native voice input included).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [How the AI Assistant Works](#how-the-ai-assistant-works)
- [Push Notifications](#push-notifications)
- [Android App (Capacitor)](#android-app-capacitor)
- [Security Notes (Read Before Deploying)](#security-notes-read-before-deploying)
- [Known Issues and Cleanup](#known-issues-and-cleanup)
- [Roadmap](#roadmap)

---

## Features

### Student portal (`index.html`)

- **Dashboard** with an overview of recent activity and quick links
- **Courses, Syllabus, Notes, Course Materials, Assignments, Announcements**, each with search and course filters
- **CSC AI assistant**: multi-conversation chat with Markdown and code highlighting, auto-generated chat titles, model switching (Gemini / Groq), file upload for document-aware answers, and voice input on the native app
- **Profile and Settings**: student details, dark mode, notification preferences, logout
- **Account activation**: students are pre-registered by admins and activate their own account using their matric number and email
- **In-app notifications** and **push notifications** (Android) for new notes, materials, assignments and announcements

### Admin dashboard (`admin.html`)

- **Content management** for courses, notes, materials, assignments, syllabus and announcements
- **Student management** with bulk import from Excel (`.xlsx`), a downloadable import template and an import preview before saving
- **Admin management** and **granular permissions**: each admin only sees the sections they have been granted
- **Activity log** of admin actions
- **Portal settings**: portal name, default session and semester, registration toggle, maintenance mode, max upload size
- Forced **password change** on first login for newly created admins

### AI assistant

- Answers from live portal data (courses, assignments, announcements, notes, materials) and refuses to invent anything that is not there
- Understands navigation commands ("open notes") and moves the student to the right page
- Reads uploaded **PDF, DOCX, TXT, PNG and JPG** files, with OCR for scanned PDFs and images, and uses them as context for that conversation
- Automatic **fallback** between Gemini and Groq if the primary model fails

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vanilla JavaScript (module-style IIFEs), HTML, CSS, Material Icons |
| Backend | Node.js (ES modules), Express 5, CORS, Multer |
| Auth | Firebase Authentication |
| Database | Firebase Realtime Database |
| File storage and document text | Supabase Storage and Supabase Postgres |
| AI models | Google Gemini (`gemini-3.1-flash-lite` for chat, `gemini-3.5-flash` for OCR), Groq (`openai/gpt-oss-120b`) |
| Document parsing | `pdfjs-dist`, `mammoth` (DOCX), Gemini Vision (OCR) |
| Push notifications | Firebase Cloud Messaging via `firebase-admin` |
| Mobile | Capacitor 8 (Android, push notifications, speech recognition, splash screen) |
| Client libraries | `marked`, `highlight.js`, SheetJS (`xlsx`) |

---

## Architecture

```
┌────────────────────────┐        ┌───────────────────────────────┐
│  Student portal        │        │  Admin dashboard              │
│  index.html + app.js   │        │  admin.html + admin*.js       │
└───────────┬────────────┘        └──────────────┬────────────────┘
            │  Firebase JS SDK (auth + RTDB)     │
            │  fetch() to Express                │
            ▼                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Express server (server.js)                  │
│  /chat   /generate-title   /upload   /register-device   /notify-*│
└───────┬──────────────┬───────────────┬───────────────┬───────────┘
        │              │               │               │
        ▼              ▼               ▼               ▼
  Gemini / Groq   Firebase Admin   Supabase        Firebase Cloud
  (chat + OCR)    (Auth + RTDB)    (files + text)   Messaging
```

The browser talks to Firebase directly for authentication and for reading and writing portal content. The Express server handles everything that needs secrets or server-side work: AI calls, file processing, user creation and push delivery.

---

## Project Structure

```
.
├── server.js                 # Express app, routes, static hosting
├── chatHandler.js            # /chat: intent -> context -> model -> fallback
├── intentClassifier.js       # LLM-based intent classifier (chat / navigate / portal)
├── portalIntent.js           # Keyword-based intent detector (rule-based alternative)
├── portalContext.js          # Turns portal data into grounded prompt context
├── gemini.js                 # Gemini client + history sanitising
├── groq.js                   # Groq client (OpenAI-compatible API)
├── titleGenerator.js         # Short chat title generation
├── uploadRoutes.js           # Multer config (50 MB limit) for /upload
├── uploadHandler.js          # Upload -> extract text -> store -> link to conversation
├── imageOCR.js / pdfOCR.js   # Gemini Vision OCR for images and scanned PDFs
├── documentRetriever.js      # Loads a conversation's document text for the prompt
├── supabaseStorage.js        # Upload / delete files, public URLs
├── supabaseDatabase.js       # Store and fetch chunked document text
├── firebase-admin.js         # Firebase Admin initialisation (auth, db, messaging)
├── firebaseHelpers.js        # Read portal sections from RTDB
├── notificationHandler.js    # Register devices, send single / bulk pushes
├── notificationService.js    # Typed notifications (note, material, assignment, announcement)
├── data.json                 # Empty seed structure and default settings
├── uicsc-prime-default-rtdb-export.json  # Sample RTDB export
└── public/                   # Everything served to the browser
    ├── index.html            # Student portal
    ├── login.html            # Admin login
    ├── student-login.html    # Student login + account activation
    ├── admin.html            # Admin dashboard
    ├── change-password.html  # Forced password change for new admins
    ├── forgot-password.html
    ├── firebase.js           # Firebase web config (+ SERVER_URL)
    ├── supabase.js           # Supabase web client
    ├── app.js                # Student portal bootstrap
    ├── admin*.js             # One module per admin section
    ├── ai.js, api.js, chatManager.js, renderer.js, markdown.js, prompts.js ...  # AI chat UI
    ├── notes.js, materials.js, assignments.js, syllabus.js, courses.js ...      # Student pages
    ├── pushNotifications.js, push.js, nativeBridge.js, nativeVoice.js           # Native (Capacitor) hooks
    └── styles.css, admin.css, student-login.css, change-password.css
```

---

## Getting Started

### Prerequisites

- Node.js 18 or newer (20+ recommended)
- A Firebase project with **Authentication** (email/password), **Realtime Database** and **Cloud Messaging** enabled
- A Supabase project with a storage bucket and a `document_chunks` table (see [Data Model](#data-model))
- API keys for Google Gemini and Groq

### Installation

```bash
git clone https://github.com/peterprime1-web/UI-CSC-Website.git
cd UI-CSC-Website
npm install
```

### Configuration

1. Create a `.env` file in the project root (see [Environment Variables](#environment-variables)).
2. Download a Firebase **service account** key from *Firebase Console, Project settings, Service accounts* and save it as `serviceAccount.json` in the project root. Do not commit it.
3. In `public/firebase.js`, set your Firebase web config and change `SERVER_URL` to your backend URL.
4. In `public/supabase.js`, set your Supabase URL and **anon** key.
5. Seed your Realtime Database using `data.json` as the starting structure, then create the first admin (see below).

### Create the first admin

Create an admin user in Firebase Authentication, then add a matching record under `admins/` in the Realtime Database:

```json
{
  "name": "Portal Admin",
  "email": "admin@example.com",
  "uid": "<firebase auth uid>",
  "status": "Active",
  "permissions": {
    "dashboard": true, "courses": true, "notes": true, "materials": true,
    "assignments": true, "syllabus": true, "announcements": true,
    "students": true, "admins": true, "permissions": true,
    "settings": true, "activity": true
  }
}
```

Admins created later from the dashboard can be given a subset of these permissions.

### Run

```bash
npm start
```

The server listens on `PORT` (default `3000`):

| URL | What it is |
| --- | --- |
| `http://localhost:3000/` | Student portal |
| `http://localhost:3000/student-login.html` | Student login / activation |
| `http://localhost:3000/login.html` | Admin login |
| `http://localhost:3000/admin.html` | Admin dashboard |
| `http://localhost:3000/health` | Health check |

---

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_KEY` | Yes | Gemini API key for chat, intent classification and titles. The server throws on startup if missing. |
| `GROQ_KEY` | Yes | Groq API key. The server throws on startup if missing. |
| `GEMINI_VISION_KEY` | For OCR | Gemini API key used for image and scanned-PDF OCR. |
| `FIREBASE_DATABASE_URL` | Yes | Realtime Database URL, for example `https://<project>-default-rtdb.firebaseio.com/`. |
| `SUPABASE_URL` | Yes | Supabase project URL. |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase **service role** key (server only, never ship to the browser). |
| `ALLOWED_ORIGIN` | Recommended | CORS origin. Defaults to `*` if unset. |
| `PORT` | No | Server port, default `3000`. |

Example `.env`:

```env
GEMINI_KEY=your-gemini-key
GROQ_KEY=your-groq-key
GEMINI_VISION_KEY=your-gemini-vision-key
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ALLOWED_ORIGIN=https://your-domain.com
PORT=3000
```

---

## Data Model

### Firebase Realtime Database

| Node | Purpose |
| --- | --- |
| `courses` | Course code, title, lecturer, semester, level |
| `notes` | Lecture notes (title, course, file) |
| `materials` | Course materials (title, course, type, file) |
| `assignments` | Title, course, due date, description |
| `syllabus` | Course outlines |
| `announcements` | Title, message, date |
| `students` | Pre-registered students: name, matric number, email, level, status, `uid`, `fcmToken`, online status |
| `admins` | Admin accounts: `uid`, status, `permissions`, `mustChangePassword` |
| `activity` | Admin activity log |
| `settings` | Portal name, default session and semester, registration, maintenance mode, max upload size |
| `portal/materials/<id>` | Metadata for files uploaded through the AI chat |
| `portal/conversations/<id>/documents/<docId>` | Links uploaded documents to a chat conversation |

### Supabase

- **Storage bucket:** `portal-files` (uploads go under `materials/`)
- **Table `document_chunks`:**

  | Column | Type |
  | --- | --- |
  | `document_id` | text |
  | `chunk_index` | integer |
  | `content` | text (1,000-character chunks) |

---

## API Reference

All routes are served by `server.js`. JSON in, JSON out unless noted.

| Method | Route | Body | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | n/a | Liveness check |
| `POST` | `/chat` | `message`, `history[]`, `model` (`gemini` or `groq`), `context`, `conversationId` | AI chat. Returns `{ reply, model, action }`. `action` is set for navigation requests. |
| `POST` | `/generate-title` | `message`, `model` | Returns `{ title }` for a new chat |
| `POST` | `/upload` | `multipart/form-data`: `file`, `conversationId` | Stores a file, extracts its text and attaches it to the conversation. Allowed: PDF, DOCX, TXT, PNG, JPG. |
| `POST` | `/register-device` | `uid`, `token` | Saves a student's FCM token |
| `POST` | `/notify-announcement` | `title`, `message` | Push to all registered students |
| `POST` | `/notify-assignment` | `title`, `message` | Push to all registered students |
| `POST` | `/notify-notes` | `title`, `message` | Push to all registered students |
| `POST` | `/notify-materials` | `title`, `message` | Push to all registered students |
| `POST` | `/create-admin` | `email`, `password`, `name` | Creates a Firebase Auth user |
| `POST` | `/bootstrap-admin` | n/a | One-off helper that creates a placeholder admin (see security notes) |

---

## How the AI Assistant Works

1. **Intent detection.** Each message goes through `classifyIntent`, which asks Gemini to return JSON of type `chat`, `navigate` or `portal`.
2. **Navigation.** For `navigate`, the server replies with an `action` and the client switches page.
3. **Portal grounding.** For `portal`, the relevant Realtime Database section is fetched and `buildPortalContext` formats it with a strict "never invent portal information" instruction.
4. **Document context.** If the conversation has uploaded files, their stored text is loaded from Supabase and trimmed (6,000 characters) into the prompt.
5. **Generation.** The prompt is sent to the selected model. If it fails, the server retries once on the other provider with a shorter prompt and the last 8 messages.
6. **System prompt.** `public/prompts.js` defines the assistant's persona (friendly, student-like, step-by-step teaching, Markdown formatting, never fabricate portal data).

### Document ingestion pipeline

```
Upload -> Supabase Storage -> extract text
          PDF: pdfjs-dist  (falls back to Gemini OCR if under 300 characters of text)
          DOCX: mammoth
          TXT: raw
          PNG/JPG: Gemini Vision OCR
       -> split into 1,000-character chunks -> Supabase `document_chunks`
       -> link document to conversation in Realtime Database
```

---

## Push Notifications

- On the native app, the device registers with FCM and the token is saved to the student's record via `/register-device`.
- When an admin publishes an announcement, assignment, note or material, the corresponding `/notify-*` endpoint sends a multicast push to every student with a stored token.
- Notifications use the Android channel `csc_elite`.
- `notificationService.js` provides a typed helper (`notify("assignment", name, id)`) with icons and titles per content type.

---

## Android App (Capacitor)

The repository already includes the Capacitor dependencies (`@capacitor/core`, `@capacitor/android`, `@capacitor/push-notifications`, `@capacitor-community/speech-recognition`, `@capacitor/splash-screen`). The `android/` folder and `capacitor.config.js` are git-ignored, so generate them locally:

```bash
npx cap init            # create capacitor.config.js (set appId and webDir: "public")
npx cap add android
npx cap sync
npx cap open android
```

Add your `google-services.json` to the Android project for FCM. Because the app loads the portal from `public/`, make sure `SERVER_URL` in `public/firebase.js` points to your deployed backend, not `localhost`.

---

## Security Notes (Read Before Deploying)

This section matters. Several items below should be fixed before the project is public or used with real student data.

1. **`serviceAccount.json` is in the repository and is not git-ignored.** It contains a Firebase service account private key, which gives full admin access to your Firebase project. If this repo has ever been pushed to a public or shared remote, treat the key as compromised: **revoke it in Google Cloud Console (IAM, Service Accounts, Keys), generate a new one, and keep it out of git** (add it to `.gitignore`, or load it from an environment variable on your host). Removing the file from the latest commit is not enough, as it remains in git history.
2. **Admin-sensitive endpoints have no authentication.** `/create-admin`, `/bootstrap-admin` and all `/notify-*` routes can be called by anyone who can reach the server. Protect them by verifying a Firebase ID token (`auth.verifyIdToken`) and checking the caller is an active admin with the right permission. Delete `/bootstrap-admin` once the first admin exists, since it contains placeholder credentials.
3. **`/chat`, `/upload` and `/generate-title` are unauthenticated**, so anyone can spend your Gemini and Groq quota and upload files up to 50 MB. Require a valid ID token and add rate limiting.
4. **CORS defaults to `*`.** Set `ALLOWED_ORIGIN` in production.
5. **Firebase Realtime Database rules.** The browser reads and writes the database directly, and the student login scans the whole `students` node. Make sure your rules enforce per-role access, otherwise any signed-in user could read or modify data they should not. Prefer querying by `uid` (`orderByChild("uid").equalTo(...)`) with an index instead of downloading the full node.
6. **Permissions are enforced on the client.** `window.can()` hides UI, but real enforcement must live in database rules or server routes. Note that `can()` currently returns `true` for admins with an empty permissions object (legacy accounts).
7. **Supabase.** The anon key in `public/supabase.js` is meant to be public, but the **service role key** must only ever live in the server environment. Uploaded files are served through public URLs, so do not upload anything private.
8. **Secrets files.** `groqkey.env` is an empty placeholder. Keep real keys in `.env` and make sure `.env` is git-ignored.

---

## Known Issues and Cleanup

- `.gitignore` is missing `.env` and `serviceAccount.json`.
- Stray files at the repo root: `,gitignore` (typo copy of `.gitignore`) and an empty file named `{`.
- `public/firebase.js` hard-codes `SERVER_URL = "http://localhost:3000"`.
- `portalIntent.js` (keyword-based) is unused; `chatHandler.js` uses the LLM classifier instead. Pick one, or use the keyword matcher as a fast path before calling the model.
- `portalContext.js` is built for several sections at once but `chatHandler.js` only passes in one, so cross-topic questions get limited context.
- `public/csc-ai.html` is empty, and `ai-actions.js` references a `forum` page that does not exist in this version.
- `test.js` is a scratch file and `npm test` is not configured.
- `package.json` includes both `@google/genai` and `@google/generative-ai`, and several unused packages (`canvas`, `pdf-to-img`, `pdf2pic`). Consider removing what you do not use.
- `uicsc-prime-default-rtdb-export.json` contains sample student records; do not commit real student data.
- The chat UI retries on the opposite model after a failure, and the server also falls back on its own, so one failure can trigger two retries.
- Firebase JS SDK v8 is loaded from the CDN; v9+ (modular) is the current supported line.

---

## Roadmap

Ideas that fit the current architecture:

- Token-verified backend routes with role and permission checks
- Retrieval over document chunks (embeddings or keyword search) instead of sending the first 6,000 characters
- Discussion forum with threaded replies, reactions and unread markers
- Offline indicator and consistent loading, empty and error states
- Stylesheet cleanup and splitting `styles.css`
- Automated tests and a CI workflow

---

## Newer versions more advanced and cleaner are available, but in private repositories. Contact the author for access

## Author

Built by Peter Afolayan (Peterprime), Computer Science, University of Ibadan. (07072605719{Whatsapp, Phone, SMS}, petergeniusprime@gmail.com)
