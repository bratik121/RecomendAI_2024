# RecomendAI · What2Watch 🎬

RecomendAI — branded **What2Watch** in the UI — is a full-stack movie discovery and
recommendation platform. It combines a personalized content-based recommender, community
ratings and comments, a watchlist, achievements, and an AI movie assistant with
retrieval-augmented generation (RAG).

![Status](https://img.shields.io/badge/Status-Active%20development-yellow)
![Backend](https://img.shields.io/badge/Backend-Django%20REST%20Framework-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![ML](https://img.shields.io/badge/ML-Random%20Forest-orange)
![AI](https://img.shields.io/badge/AI-Gemini-purple)
![License](https://img.shields.io/badge/License-BSD%202--Clause-blue)

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [How it works](#how-it-works)
- [Data model](#data-model)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API](#api)
- [Recommendation maintenance](#recommendation-maintenance)
- [Testing](#testing)
- [Windows CLI](#windows-cli)
- [Production notes](#production-notes)
- [Future improvements](#future-improvements)
- [License](#license)

---

## Overview

Choosing what to watch is hard when every streaming service offers a seemingly endless
catalog. RecomendAI learns from each user's ratings and likes, builds a preference profile,
and ranks movies that the user has not interacted with yet.

The main request path is:

```text
React SPA (recommendAiWeb)
        │
        ▼
Django REST API (recommendAIApi)
        ├── PostgreSQL
        ├── scikit-learn recommender
        ├── Gemini + movie retrieval (chat)
        └── Cloudinary (optional media storage)
```

The interface is available in **Spanish and English**, supports **light and dark themes**,
and adapts to mobile and desktop layouts.

---

## Features

### Movie discovery and personalization

- **Personalized recommendations** using a Random Forest classifier trained on each user's
  interactions and movie metadata.
- **Swipe-based rating flow**: authenticated users review batches of 10 movies and mark them
  as liked or disliked; the labels feed the recommender.
- **Popularity fallback**: users without interaction history receive popular movies instead
  of an empty or unreliable prediction.
- **Search** by title with pagination and community rating data.
- **Movie detail page** with poster, release year, genres, overview, popularity, community
  rating distribution, star rating, comments, and watchlist controls.

### Community and account features

- **Token authentication** and self-registration.
- **Profile management**, including name, bio, and avatar upload (JPG, PNG, or WebP, max 2 MB).
- **1–5 star ratings** and like signals.
- **Threaded comments** with one level of replies, author-only editing, and soft deletion.
- **Watchlist** with pending/watched tabs and summary counters.
- **Achievements**: 30 unlockable achievements across ratings, comments, watchlist, chat,
  seen movies, and likes.
- **Ranks**: Novato, Explorador, Cinéfilo, Crítico, and Maestro. Ranks are derived from
  unlocked achievements and can also be overridden by an administrator.

### AI assistant

- **Gemini-powered chat** with retrieval of real movies from the database.
- The model receives a restricted movie context and may only return IDs from that context;
  invented IDs are discarded.
- Conversations are persisted per user and can be resumed.
- **Quota by rank**, with a daily limit for the Maestro rank.

### Administration

- **Admin dashboard** at `/admin` with KPI cards and charts for registrations, comments,
  interactions, rating distribution, top-seen movies, and popular genres.
- **Movie management** with create/update, archive/restore (soft delete), poster upload,
  search, filters, and pagination.
- **User management** with search, role filters, activation/deactivation, role changes, and
  rank overrides.
- **Comment moderation** with search and soft deletion.
- **Three roles**: `root`, `admin`, and `user`, with safeguards around the last active root.

### UX and platform

- Responsive layout with a mobile navigation menu.
- Spanish/English internationalization via i18next.
- Light/dark theme with persisted preference.
- Animated transitions, loading states, empty states, and toast notifications.
- Optional Cloudinary storage; local media storage is used when credentials are absent.

---

## Tech stack

### Backend

| Technology                | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| Python 3.12 (recommended) | Backend language                             |
| Django                    | Web framework                                |
| Django REST Framework     | REST API and token authentication            |
| PostgreSQL 16             | Primary database                             |
| scikit-learn              | Random Forest recommender and genre encoding |
| pandas / NumPy            | Data loading and numeric processing          |
| Google Gen AI SDK         | Gemini chat integration                      |
| Redis (optional)          | Shared cache backend in production           |
| Cloudinary (optional)     | Media storage for avatars and posters        |
| Gunicorn                  | Production WSGI server                       |

### Frontend

| Technology                         | Purpose                                    |
| ---------------------------------- | ------------------------------------------ |
| React 18 + TypeScript              | UI                                         |
| Vite 8                             | Development server and build tooling       |
| Tailwind CSS 4                     | Styling                                    |
| Redux Toolkit + React Redux        | Authentication, movie, and watchlist state |
| TanStack React Query               | Server-state fetching and caching          |
| React Router 7                     | Client-side routing                        |
| i18next / react-i18next            | Spanish and English translations           |
| Framer Motion                      | Page and component animations              |
| Radix UI / shadcn-style components | Accessible UI primitives                   |
| Recharts                           | Admin dashboard charts                     |
| Sonner                             | Toast notifications                        |

### Tooling

| Tool                       | Purpose                        |
| -------------------------- | ------------------------------ |
| Docker Compose             | Local PostgreSQL 16 service    |
| PowerShell CLI (`cli.ps1`) | Windows development workflow   |
| npm                        | Frontend dependency management |
| pip + venv                 | Backend dependency management  |
| Vercel rewrites            | SPA fallback configuration     |

> Docker Compose in this repository starts **only PostgreSQL**. There are currently no
> Dockerfiles for the Django or Vite services.

---

## How it works

### Recommendation engine

The recommender is a **content-based classifier**, not a collaborative-filtering system.

1. **Feature extraction** — the active movie catalog is converted into a numeric matrix:
   - `popularity`, `vote_average`, and `revenue`;
   - multi-label one-hot encoding of genres.
2. **Label construction** — each user's interactions become training labels:
   - rating `>= 4` → liked;
   - rating `<= 2` → disliked;
   - rating `3` or no rating → the interaction's `liked` value.
3. **Training** — a `RandomForestClassifier` with 50 trees is fitted for the current user.
4. **Scoring** — the model scores every catalog movie, and movies the user has already
   interacted with are excluded from the candidate set.
5. **Fallback** — users with no interaction history receive the most popular active movies.
6. **Caching** — the top 20 recommendations are stored per user in `RecommendationCache`.
   The API shuffles those 20 and returns 10.

The cache key includes:

- a SHA-256 fingerprint of the user's interaction history;
- the global catalog version (`CatalogState`);
- the recommender version (`RECOMMENDER_VERSION`, currently `rf-v1`).

New ratings, likes, and batch rating submissions invalidate the affected user's cache. The
API exposes the cache state through the `X-Recommend-Cache: HIT|MISS` response header.

> This approach is intentionally simple and interpretable for a portfolio project. It does
> not yet perform collaborative filtering or offline model evaluation.

### AI movie assistant

The chat endpoint combines **lexical retrieval** with Gemini:

1. The user's message is analyzed for an exact/partial movie title, genre, decade, and
   keywords.
2. Up to 8 real movies are retrieved from PostgreSQL as context.
3. Gemini receives a system prompt that forbids inventing titles and requires it to answer
   only with movies from the context.
4. The response is parsed as JSON, and returned movie IDs are validated against the retrieved
   candidates.
5. The user and assistant messages are persisted in the conversation.

The chat is available to authenticated users on discovery, detail, search, watchlist,
profile, and achievements pages. It is hidden during the sign-in flow, the rating flow, and
in the admin area.

The assistant requires `GEMINI_API_KEY`. Without it, the endpoint returns a controlled `503`
error instead of failing the whole application.

### Achievements, ranks, and chat quotas

Achievements are evaluated whenever a user rates a movie, comments, updates their watchlist,
uses the chat, or opens the achievements page. The catalog contains 30 achievements:
6 categories × 5 thresholds.

| Rank       | Achievements required |           Chat quota |
| ---------- | --------------------: | -------------------: |
| Novato     |                     0 |  5 messages per rank |
| Explorador |                     3 | 10 messages per rank |
| Cinéfilo   |                     6 | 15 messages per rank |
| Crítico    |                    11 | 20 messages per rank |
| Maestro    |                    16 |  10 messages per day |

Admins use the Maestro quota. A manual `rank` override on a user replaces the achievement-based
rank until it is removed.

---

## Data model

| Model                              | Purpose                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `User`                             | Custom email-based user with role, rank, bio, avatar, and activation state    |
| `Movie`                            | Catalog entry with metadata, genres, poster, and `is_active` soft-delete flag |
| `Interaction`                      | Unique user–movie record with `liked`, `seen`, `rating`, and `rated_at`       |
| `WatchlistItem`                    | Unique user–movie watchlist entry with `watched` state                        |
| `Comment`                          | Movie comment with optional parent reply and soft-delete flag                 |
| `CatalogState`                     | Global catalog version used to invalidate feature and recommendation caches   |
| `RecommendationCache`              | Materialized top-20 recommendations per user                                  |
| `Achievement` / `UserAchievement`  | Achievement catalog and unlocked achievements                                 |
| `ChatConversation` / `ChatMessage` | Persisted chat sessions and messages                                          |
| `ChatQuota`                        | Per-rank and daily chat usage counters                                        |

---

## Project structure

```text
RecomendAI_2024/
├── README.md
├── cli.ps1                        # Windows PowerShell development CLI
├── docker-compose.yml             # PostgreSQL 16 for local development
│
├── recommendAIApi/                # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── LICENSE
│   ├── App/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── login_view.py
│   │   ├── movie_views.py
│   │   ├── rating_views.py
│   │   ├── comment_views.py
│   │   ├── watchlist_views.py
│   │   ├── profile_views.py
│   │   ├── admin_views.py
│   │   ├── metrics_views.py
│   │   ├── chat_views.py
│   │   ├── chat_service.py
│   │   ├── chat_quota.py
│   │   ├── movie_retrieval.py
│   │   ├── achievement_service.py
│   │   ├── achievement_catalog.py
│   │   ├── recommendation/
│   │   │   ├── catalog.py         # Cached movie feature matrix
│   │   │   ├── engine.py          # Random Forest training and scoring
│   │   │   ├── cache.py           # Materialized recommendation cache
│   │   │   └── signals.py         # Catalog version invalidation
│   │   ├── management/commands/
│   │   │   ├── load_movies.py
│   │   │   ├── setrole.py
│   │   │   ├── benchmark_recommendations.py
│   │   │   ├── rebuild_recommendations.py
│   │   │   └── rag_probe.py
│   │   ├── migrations/
│   │   └── tests*.py
│   └── djangoProject/
│       ├── settings.py
│       └── urls.py
│
└── recommendAiWeb/                # React + Vite frontend
    ├── package.json
    ├── .env.template              # Frontend environment template
    ├── vercel.json
    └── src/
        ├── api/                   # Axios client and API modules
        ├── components/            # UI, navigation, comments, chat, admin
        ├── i18n/                  # Spanish and English locales
        ├── pages/                 # Landing, search, detail, rating, watchlist, admin
        ├── redux/                 # Store, reducers, actions, hooks
        ├── routes/
        └── utils/
```

Generated directories such as `node_modules/`, `dist/`, `venv/`, and local media uploads are
not part of the source tree.

---

## Getting started

### Prerequisites

- **Python 3.12** recommended (the codebase requires modern Python type syntax; 3.10+ may
  work, but 3.12 is the tested environment).
- **Node.js `^20.19.0` or `>=22.12.0`** and npm. Vite 8 declares these engine requirements.
- **PostgreSQL 16** or Docker with Docker Compose.
- **Git**.
- Optional: a **Gemini API key** for the AI chat and **Cloudinary** credentials for remote
  media storage.

### 1. Clone the repository

```bash
git clone https://github.com/bratik121/RecomendAI_2024.git
cd RecomendAI_2024
```

### 2. Start PostgreSQL

The included Compose file exposes PostgreSQL on `localhost:5432` with the development
credentials used by `.env.example`:

```bash
docker compose up -d postgres
```

Verify that the container is running:

```bash
docker compose ps
```

If you already have PostgreSQL installed locally, create a database and point `DATABASE_URL`
to it instead.

### 3. Backend setup

```bash
cd recommendAIApi

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows PowerShell: .\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create the local environment file
cp .env.example .env              # Windows: copy .env.example .env
```

Edit `.env` and set at least:

- `SECRET_KEY` — replace the placeholder with a new random key;
- `DATABASE_URL` — the Compose default already matches the example:
  `postgres://postgres:postgres@localhost:5432/postgres`.

Generate a Django secret key with:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Then apply migrations and create the first root user:

```bash
python manage.py migrate
python manage.py createsuperuser
```

The custom user model uses **email** as the login field, so `createsuperuser` asks for an
email instead of a username. The created superuser receives the `root` role.

Start the API:

```bash
python manage.py runserver
```

The backend runs at `http://127.0.0.1:8000/`.

### 4. Load movie data (recommended)

The application needs a movie catalog before recommendations and search are useful. Load a
CSV with the `load_movies` command:

```bash
python manage.py load_movies /path/to/movies.csv
```

The CSV must contain these columns:

```text
title, poster_path, release_date, overview, popularity, vote_average, revenue, genres
```

Notes:

- `release_date` is parsed and stored as a four-digit year.
- `genres` must be a hyphen-separated string, for example `Action-Adventure-Science Fiction`.
- `popularity`, `vote_average`, and `revenue` are normalized when loaded.
- You can also create and edit movies from the admin dashboard.

### 5. Frontend setup

In a second terminal:

```bash
cd recommendAiWeb
npm install
cp .env.template .env             # Windows: copy .env.template .env
npm run dev
```

The template sets:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

Vite normally serves the frontend at `http://localhost:5173/`.

### 6. Open the app

| Service             | URL                            |
| ------------------- | ------------------------------ |
| Frontend            | `http://localhost:5173/`       |
| Django API          | `http://127.0.0.1:8000/`       |
| App admin dashboard | `http://localhost:5173/admin`  |
| Django admin        | `http://127.0.0.1:8000/admin/` |

The frontend admin dashboard is available to users with the `admin` or `root` role. The
Django admin is available to staff users.

To promote an existing user to `admin` or `root`, run:

```bash
python manage.py setrole email@example.com root
python manage.py setrole email@example.com admin
python manage.py setrole email@example.com user
```

---

## Configuration

### Backend environment (`recommendAIApi/.env`)

Copy `.env.example` to `.env` and adjust the values. The most important variables are:

| Variable                    | Required    | Default                                       | Description                                   |
| --------------------------- | ----------- | --------------------------------------------- | --------------------------------------------- |
| `SECRET_KEY`                | **Yes**     | —                                             | Django signing key; never commit a real value |
| `DEBUG`                     | No          | `False`                                       | Enables debug mode; use `True` only locally   |
| `DATABASE_URL`              | Recommended | Local PostgreSQL URL                          | Database connection string                    |
| `ALLOWED_HOSTS`             | No          | `localhost,127.0.0.1,testserver,...`          | Comma-separated allowed hosts                 |
| `CORS_ALLOWED_ORIGINS`      | No          | `http://localhost:5173,http://127.0.0.1:5173` | Allowed frontend origins                      |
| `CSRF_TRUSTED_ORIGINS`      | No          | Local frontend origins                        | Trusted origins for CSRF                      |
| `FRONTEND_URL`              | No          | `http://localhost:5173`                       | Public frontend URL                           |
| `CACHE_URL`                 | No          | `locmemcache://recomendai`                    | Cache backend; use Redis in production        |
| `METRICS_CACHE_TTL_SECONDS` | No          | `600`                                         | Admin metrics cache TTL                       |
| `GEMINI_API_KEY`            | No          | Empty                                         | Enables the AI chat                           |
| `GEMINI_MODEL`              | No          | `gemini-2.5-flash`                            | Gemini model used by the assistant            |
| `CHAT_CONTEXT_MESSAGES`     | No          | `20`                                          | Previous messages sent as context             |
| `CHAT_MAX_MESSAGE_LENGTH`   | No          | `2000`                                        | Maximum accepted chat message length          |
| `CLOUDINARY_CLOUD_NAME`     | No          | Empty                                         | Cloudinary media storage                      |
| `CLOUDINARY_API_KEY`        | No          | Empty                                         | Cloudinary media storage                      |
| `CLOUDINARY_API_SECRET`     | No          | Empty                                         | Cloudinary media storage                      |

Behavior notes:

- Without Cloudinary credentials, uploaded avatars and posters are stored locally under
  `recommendAIApi/media/`.
- Without a Gemini key, the rest of the app works normally but the chat returns a controlled
  error.
- In development, `CORS_ALLOW_ALL_ORIGINS` defaults to `DEBUG`. Configure explicit CORS and
  CSRF origins for production.
- PostgreSQL is the default and recommended database. SQLite is not preconfigured; if you
  change `DATABASE_URL`, verify that the selected backend supports the project's JSON fields
  and queries.

### Frontend environment (`recommendAiWeb/.env`)

| Variable       | Required | Description                                  |
| -------------- | -------- | -------------------------------------------- |
| `VITE_API_URL` | Yes      | Base URL of the Django API, including `/api` |

Only variables prefixed with `VITE_` are exposed to the browser. Never put backend secrets in
the frontend environment.

---

## API

### Authentication

Send the token returned by login or registration in the `Authorization` header:

```http
Authorization: Token <your-token>
```

Example login:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}'
```

The response includes the user's profile and an API token.

### Public endpoints

| Method   | Endpoint                     | Description                                                                    |
| -------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `POST`   | `/api/User/`                 | Register a new `user` and return a token                                       |
| `POST`   | `/api/auth/login`            | Authenticate and return a token                                                |
| `GET`    | `/api/searchMoviesByName/`   | Search by `title`; accepts `id_user`, `limit`, and `offset`                    |
| `GET`    | `/api/movies/<id>/`          | Movie detail, community rating, and the authenticated user's rating if present |
| `GET`    | `/api/movies/<id>/ratings/`  | Rating average, distribution, and count                                        |
| `GET`    | `/api/movies/<id>/comments/` | Paginated root comments with their replies                                     |
| `POST`   | `/api/movies/<id>/comments/` | Create a comment (token required)                                              |
| `GET`    | `/api/comments/<id>/`        | Read a comment                                                                 |
| `PATCH`  | `/api/comments/<id>/`        | Edit your own comment                                                          |
| `DELETE` | `/api/comments/<id>/`        | Soft-delete your own comment                                                   |

### Authenticated user endpoints

| Method             | Endpoint                  | Description                                |
| ------------------ | ------------------------- | ------------------------------------------ |
| `GET` / `PATCH`    | `/api/profile/`           | Read or update the current profile         |
| `DELETE`           | `/api/profile/avatar/`    | Remove the current avatar                  |
| `POST`             | `/api/ratings/`           | Create or replace a 1–5 star rating        |
| `GET` / `PATCH`    | `/api/ratings/<id>/`      | Read or update your own rating             |
| `GET` / `POST`     | `/api/watchlist/`         | List or add watchlist items                |
| `GET`              | `/api/watchlist/summary/` | Pending, watched, and total counters       |
| `PATCH` / `DELETE` | `/api/watchlist/<id>/`    | Update the watched state or remove an item |
| `GET` / `POST`     | `/api/chat/`              | Fetch a conversation or send a message     |
| `GET`              | `/api/achievements/`      | Achievements, rank, and progress summary   |

Comments are paginated 10 per page (`page_size` up to 50). Comment creation is throttled to
10 requests per minute; chat is throttled to 20 requests per minute.

### Legacy initial-rating endpoints

These endpoints support the original batch-rating flow and are keyed by user ID in the URL
rather than by token authentication:

| Method | Endpoint                      | Description                                                     |
| ------ | ----------------------------- | --------------------------------------------------------------- |
| `GET`  | `/api/tenmovies/<idUser>/`    | Return up to 10 popular movies the user has not interacted with |
| `POST` | `/api/rateMovies`             | Submit a batch of `{id_movie, like}` reviews                    |
| `GET`  | `/api/recommend/<idUser>/`    | Return 10 personalized recommendations                          |
| `GET`  | `/api/interactions/<idUser>/` | Return the user's interaction history                           |

`/api/recommend/<idUser>/` trains or reads the cached model, shuffles the cached top 20, and
returns the final 10. Check `X-Recommend-Cache` to distinguish a cache hit from a
recalculation.

### Admin endpoints

All endpoints below require an authenticated `admin` or `root` user. Role changes require
`root`.

| Method                     | Endpoint                                               | Description                                               |
| -------------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| `GET` / `POST`             | `/api/admin/movies/`                                   | List (search, active filter, pagination) or create movies |
| `GET` / `PATCH` / `DELETE` | `/api/admin/movies/<id>/`                              | Retrieve, update, or archive a movie                      |
| `POST`                     | `/api/admin/movies/<id>/restore/`                      | Restore an archived movie                                 |
| `GET`                      | `/api/admin/movies/genres/`                            | List genres already present in the catalog                |
| `GET` / `POST`             | `/api/admin/users/`                                    | List (search, role, active filter) or create users        |
| `GET` / `PATCH` / `DELETE` | `/api/admin/users/<id>/`                               | Retrieve, update, or deactivate a user                    |
| `POST`                     | `/api/admin/users/<id>/activate/`                      | Reactivate a user                                         |
| `POST`                     | `/api/admin/users/<id>/set_role/`                      | Change a user's role (root only)                          |
| `GET`                      | `/api/admin/comments/`                                 | List comments with search and deletion filters            |
| `POST`                     | `/api/admin/comments/<id>/moderate/`                   | Soft-delete and clear a comment                           |
| `GET`                      | `/api/admin/metrics/overview/?range=7d\|30d\|90d\|all` | Aggregated admin metrics                                  |

Administrative deletes are intentional soft deletes:

- movies are archived with `is_active=False`;
- users are deactivated with `is_active=False`;
- comments are marked as deleted and their body is cleared.

The API also protects against self-demotion, deactivating yourself, and removing or
deactivating the last active `root` user.

---

## Recommendation maintenance

The recommender caches the movie feature matrix in memory per process. The materialized
top-20 list is stored in PostgreSQL and is considered valid only when all of these match:

- the user's interaction fingerprint;
- the catalog version;
- the recommender version;
- the cache TTL (`RECOMMENDATION_CACHE_TTL_SECONDS`, 7 days by default).

Useful management commands:

```bash
# Measure cold-start latency, p50/p95, and cache hits for a user
python manage.py benchmark_recommendations --user 1 --runs 5

# Recalculate recommendations for one user or the whole user base
python manage.py rebuild_recommendations --user 1
python manage.py rebuild_recommendations

# Invalidate caches without recalculating them
python manage.py rebuild_recommendations --no-warm

# Inspect retrieval behavior for the chat without calling Gemini
python manage.py rag_probe
```

---

## Testing

### Backend

The Django test suite covers recommendations, recommendations caching, achievements and chat
quotas, comments, movie endpoints, metrics caching, and RAG retrieval:

```bash
cd recommendAIApi
source venv/bin/activate        # Windows: .\venv\Scripts\Activate.ps1
python manage.py test
```

The tests use the configured database. With the default settings, ensure PostgreSQL is
running and the configured user can create a test database.

### Frontend

There is currently no frontend test script. The production build command runs the TypeScript
compiler before Vite:

```bash
cd recommendAiWeb
npm run build
npm run preview
```

The repository does not currently include a working ESLint configuration, despite the
`lint` script being present in `package.json`.

---

## Windows CLI

`cli.ps1` provides a Windows PowerShell workflow. It is optional and is not required for
Linux or macOS development.

The CLI expects the backend virtual environment to exist at `recommendAIApi/venv` (or
`.venv`). Create it first as described in the backend setup section, then run commands from
the repository root:

```powershell
.\cli.ps1 help
.\cli.ps1 doctor
```

| Command              | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `.\cli.ps1 start`    | Start backend and frontend in separate terminal windows      |
| `.\cli.ps1 backend`  | Start only Django                                            |
| `.\cli.ps1 frontend` | Start only Vite                                              |
| `.\cli.ps1 install`  | Install backend and frontend dependencies                    |
| `.\cli.ps1 migrate`  | Run `makemigrations` and `migrate`                           |
| `.\cli.ps1 test`     | Run backend tests and the frontend test script if one exists |
| `.\cli.ps1 build`    | Build the frontend for production                            |
| `.\cli.ps1 doctor`   | Show detected paths, Python, Django, Node, and npm versions  |
| `.\cli.ps1 help`     | Show CLI help                                                |

To see logs in the current terminal:

```powershell
.\cli.ps1 backend -SameWindow
.\cli.ps1 frontend -SameWindow
```

If PowerShell blocks the script, allow local scripts for the current session:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

There is no `cli.bat` wrapper in the repository; invoke `cli.ps1` directly.

---

## Production notes

This repository contains the application code and a PostgreSQL Compose service, but it does
not yet include production Dockerfiles or a deployment pipeline for the API/frontend.

Before deploying the backend:

- set `DEBUG=False`;
- use a strong, private `SECRET_KEY`;
- configure `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`;
- use a managed PostgreSQL instance through `DATABASE_URL`;
- configure a shared cache such as `redis://...` through `CACHE_URL`;
- configure Cloudinary if media should survive container restarts;
- set `GEMINI_API_KEY` if the AI chat should be enabled;
- run migrations and serve the application with Gunicorn:

```bash
python manage.py migrate
gunicorn djangoProject.wsgi:application
```

For the frontend:

```bash
cd recommendAiWeb
npm run build
```

Deploy the generated `dist/` directory and set `VITE_API_URL` to the public API URL. The
included `vercel.json` rewrites all routes to `index.html`, which is required for the React
Router SPA routes.

---

## Future improvements

- [ ] Add collaborative filtering or a hybrid recommender.
- [ ] Add offline evaluation metrics such as precision@k, recall@k, and NDCG.
- [ ] Show explanations for individual recommendations.
- [ ] Add frontend unit/integration tests and restore a working ESLint configuration.
- [ ] Add CI checks for backend tests, TypeScript compilation, and production builds.
- [ ] Add Dockerfiles and a complete Compose stack for the API and frontend.
- [ ] Evaluate embeddings or PostgreSQL full-text/vector search for chat retrieval.
- [ ] Add observability, structured logging, and error tracking.
- [ ] Add a password-reset flow and notification emails.
- [ ] Continue accessibility and performance audits.

---

## License

This project is licensed under the **BSD 2-Clause License**. See
[`recommendAIApi/LICENSE`](./recommendAIApi/LICENSE) for the full text.

Copyright (c) 2024, GelArria.

---

## Author

RecomendAI / What2Watch was developed as a full-stack movie recommendation and discovery
project.
