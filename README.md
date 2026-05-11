# RecomendAI 🎬

RecomendAI is an intelligent movie recommendation system powered by machine learning. It helps users discover movies aligned with their preferences by analyzing user interactions and movie metadata such as genres, popularity, ratings, and revenue.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Backend](https://img.shields.io/badge/Backend-Django%20REST%20Framework-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![ML](https://img.shields.io/badge/ML-Random%20Forest-orange)

---

## 🌟 Overview

In a world with endless streaming options, choosing what to watch can be overwhelming. **RecomendAI** solves this by going beyond generic “most watched” lists and using user behavior to generate personalized movie recommendations.

The system combines a Django REST API, a React/Vite frontend, and a machine learning recommendation engine that learns from user interactions such as liked and watched movies. Based on this interaction history, the backend builds a user preference profile and recommends movies that are more likely to match the user’s taste.

---

## ✨ Core Features

- **Personalized Movie Recommendations**: Generates movie suggestions based on each user’s interaction history.
- **Machine Learning Recommendation Engine**: Uses movie metadata and user behavior to predict which movies a user may like.
- **Interactive Movie Rating Flow**: Users can mark movies as liked or seen to improve the recommendation quality.
- **Smart Movie Search**: Allows users to search movies by title.
- **Movie Discovery Experience**: Supports curated discovery flows such as initial rating selections and recommended movie lists.
- **Detailed Movie Information**: Displays metadata such as title, poster, release year, overview, popularity, vote average, revenue, and genres.
- **Django REST API**: Provides backend endpoints for authentication, movies, interactions, and recommendations.
- **Modern React Frontend**: Built with React and Vite for a fast development experience.
- **Developer CLI**: Includes a PowerShell CLI to simplify installation, migrations, development startup, testing, and build commands.

---

## 🧠 Machine Learning Approach

RecomendAI uses a **content-based filtering** strategy supported by a **Random Forest Classifier**.

The recommendation engine focuses on the relationship between movie features and the user’s previous interactions. Instead of recommending only globally popular movies, it builds predictions based on what the user has liked or seen.

### How the recommendation flow works

1. **Movie Feature Extraction**
   - The system extracts relevant features from movie records.
   - Genres are transformed into machine-readable values using multi-label encoding.
   - Numeric metadata such as popularity, vote average, and revenue are used as predictive features.

2. **User Interaction Profiling**
   - User interactions are used as feedback signals.
   - Movies liked by the user become positive preference examples.
   - Movies seen but not liked can be used as negative or lower-preference examples depending on the implemented logic.

3. **Model Training**
   - A Random Forest model is trained using the user’s available interaction history.
   - The model learns patterns between movie characteristics and the user’s preferences.

4. **Prediction**
   - The model estimates the probability that the user will like movies they have not interacted with yet.

5. **Ranking**
   - Movies are ranked according to predicted preference probability.
   - The API returns the most relevant recommendations.

### ML Libraries

- **scikit-learn**: Random Forest model and preprocessing utilities.
- **pandas**: Data manipulation and feature preparation.
- **numpy**: Numeric operations and array processing.

> The current recommendation approach is practical and interpretable for a portfolio-level recommendation system. Future versions could evolve into collaborative filtering, matrix factorization, embeddings, or a hybrid recommendation architecture.

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Python | Backend language |
| Django | Web framework |
| Django REST Framework | API layer |
| PostgreSQL / SQLite | Database support |
| scikit-learn | Machine learning model |
| pandas | Data processing |
| numpy | Numeric processing |

### Frontend

| Technology | Purpose |
|---|---|
| React | UI framework |
| Vite | Development server and build tooling |
| TypeScript | Frontend typing |
| Tailwind CSS | Styling |
| Redux Toolkit | State management |
| Framer Motion | Animations |
| Lottie | Animated visual assets |
| React Icons | Icon library |
| Splide | Carousel components |

### Developer Tooling

| Tool | Purpose |
|---|---|
| PowerShell CLI | Simplifies common development commands |
| npm | Frontend dependency management |
| pip | Backend dependency management |
| Django migrations | Database schema management |

---

## 🏗️ Project Architecture

```text
RecomendAI_2024/
├── cli.ps1                     # PowerShell CLI for development workflow
├── cli.bat                     # Optional Windows wrapper for cli.ps1
│
├── recommendAIApi/             # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── venv/                   # Local Python virtual environment
│   ├── App/                    # Main backend application
│   │   ├── management/         # Custom Django commands
│   │   ├── migrations/         # Database migrations
│   │   ├── models.py           # User, Movie, and Interaction models
│   │   ├── serializers.py      # DRF serializers
│   │   ├── views.py            # API views and viewsets
│   │   └── remomendMovies_view.py
│   │       # Machine learning recommendation logic
│   └── djangoProject/          # Django project settings
│
└── recommendAiWeb/             # React + Vite frontend
    ├── package.json
    ├── vite.config.*
    └── src/
        ├── components/         # Reusable UI components
        ├── pages/              # Page-level components
        ├── redux/              # State management
        └── assets/             # Images and animations
```

> If your local frontend folder has a different name, update the CLI configuration at the top of `cli.ps1`.

---

## 🚀 Installation and Setup

### Prerequisites

Make sure you have installed:

- Python 3.10+
- Node.js and npm
- PostgreSQL, or SQLite for local development
- PowerShell, if using the included CLI

---

## ⚡ Quick Start with CLI

The project includes a PowerShell CLI that simplifies the development workflow.

Place `cli.ps1` in the root folder:

```text
RecomendAI_2024/
├── cli.ps1
├── recommendAIApi/
└── recommendAiWeb/
```

### Show help

```powershell
.\cli.ps1 help
```

### Run project diagnostics

```powershell
.\cli.ps1 doctor
```

The `doctor` command checks:

- Detected project root
- Detected backend path
- Detected frontend path
- Backend virtual environment
- Python version
- pip version
- Django version
- Node.js version
- npm version
- Available frontend scripts

### Install all dependencies

```powershell
.\cli.ps1 install
```

This installs:

- Backend dependencies from `requirements.txt`
- Frontend dependencies from `package.json`

### Run database migrations

```powershell
.\cli.ps1 migrate
```

### Start backend and frontend

```powershell
.\cli.ps1 start
```

This starts:

- Django backend server
- Vite frontend development server

The CLI opens separate terminal windows so both processes can keep running at the same time.

### Start only the backend

```powershell
.\cli.ps1 backend
```

### Start only the frontend

```powershell
.\cli.ps1 frontend
```

### Debug backend in the same terminal

```powershell
.\cli.ps1 backend -SameWindow
```

### Debug frontend in the same terminal

```powershell
.\cli.ps1 frontend -SameWindow
```

Use `-SameWindow` when you need to see the real error output directly in the current terminal.

### Run tests

```powershell
.\cli.ps1 test
```

### Build frontend for production

```powershell
.\cli.ps1 build
```

### CLI Commands

| Command | Description |
|---|---|
| `.\cli.ps1 start` | Starts frontend and backend in development mode |
| `.\cli.ps1 backend` | Starts only the Django backend |
| `.\cli.ps1 frontend` | Starts only the Vite frontend |
| `.\cli.ps1 install` | Installs backend and frontend dependencies |
| `.\cli.ps1 migrate` | Runs Django migrations |
| `.\cli.ps1 test` | Runs backend and frontend tests |
| `.\cli.ps1 build` | Builds the frontend for production |
| `.\cli.ps1 doctor` | Shows project diagnostics |
| `.\cli.ps1 help` | Shows CLI help |

### Optional Windows wrapper

The project may also include a `cli.bat` file:

```bat
@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0cli.ps1" %*
```

This wrapper allows running the CLI through:

```powershell
.\cli.bat start
```

It is useful on Windows because it runs the PowerShell script with `ExecutionPolicy Bypass`, avoiding local script execution restrictions.

---

## 🧩 Manual Setup

If you prefer not to use the CLI, you can run the backend and frontend manually.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/RecomendAI.git
cd RecomendAI_2024
```

### 2. Backend setup

```powershell
cd recommendAIApi

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Optional: load initial movie data
python manage.py load_movies path\to\movies.csv

# Start backend server
python manage.py runserver
```

By default, the backend should run at:

```text
http://127.0.0.1:8000/
```

### 3. Frontend setup

```powershell
cd ../recommendAiWeb

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Vite usually runs at:

```text
http://localhost:5173/
```

---

## 📖 Usage

### Main API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/login` | `POST` | Authenticates a user |
| `/api/recommend/<idUser>/` | `GET` | Returns personalized movie recommendations |
| `/api/searchMoviesByName/` | `GET` | Searches movies by title |
| `/api/rateMovies` | `POST` | Registers movie interactions such as liked or seen |
| `/api/tenmovies/<idUser>/` | `GET` | Returns movies for the initial rating flow |

### User Flow

1. **Register or log in**
   - The user accesses the application and authenticates.

2. **Rate initial movies**
   - The user interacts with a first set of movies.

3. **Generate recommendations**
   - The backend processes user interactions and movie metadata.

4. **Explore results**
   - The frontend displays personalized movie recommendations.

5. **Continue improving the model**
   - More user interactions provide better preference signals.

---

## 🔄 Recommendation Flow

```text
User interaction
      ↓
Liked / seen movie data
      ↓
Movie feature extraction
      ↓
Genre encoding + numeric metadata processing
      ↓
Random Forest model training
      ↓
Prediction over unseen movies
      ↓
Ranked movie recommendations
      ↓
Frontend recommendation UI
```

---

## 🧪 Development Tips

### Check project health

```powershell
.\cli.ps1 doctor
```

### See backend errors directly

```powershell
.\cli.ps1 backend -SameWindow
```

### See frontend errors directly

```powershell
.\cli.ps1 frontend -SameWindow
```

### If PowerShell blocks script execution

Run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

Then retry:

```powershell
.\cli.ps1 start
```

Or use:

```powershell
.\cli.bat start
```

---

## 📸 Demo

<!-- Add screenshots or GIFs here -->

Coming soon.

Suggested screenshots:

- Landing page
- Movie search
- Initial rating flow
- Recommendation results
- Movie detail view

---

## 🔮 Future Improvements

- [ ] Add collaborative filtering based on users with similar preferences.
- [ ] Implement a hybrid recommendation engine combining content-based and collaborative approaches.
- [ ] Add model evaluation metrics such as precision, recall, F1-score, or ranking metrics.
- [ ] Improve recommendation explainability by showing why each movie was recommended.
- [ ] Add a model retraining pipeline.
- [ ] Add user profile preferences such as favorite genres or excluded genres.
- [ ] Add deployment configuration for backend and frontend.
- [ ] Add Docker support for easier local setup.
- [ ] Improve frontend loading states and error handling.
- [ ] Add trailers or external movie metadata integrations.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

## 👨‍💻 Author

Developed as a full-stack machine learning movie recommendation project.
