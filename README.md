# RecomendAI 🎬

RecomendAI es un sistema inteligente de recomendación de películas que utiliza machine learning para ayudar a los usuarios a descubrir su próxima película favorita. Al analizar las interacciones de los usuarios y los metadatos de las películas, RecomendAI ofrece sugerencias personalizadas adaptadas a los gustos individuales.

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)

---

## 🌟 Descripción General

En una era de contenido infinito, encontrar una película que realmente resuene con nosotros puede ser un desafío. **RecomendAI** resuelve esto yendo más allá de las listas genéricas de "lo más visto". Utiliza un backend sofisticado para aprender de tus "me gusta" y películas vistas, procesando datos complejos como géneros, métricas de popularidad e ingresos para predecir qué disfrutarás a continuación.

Ya sea que busques una joya oculta o un éxito de taquilla, RecomendAI agiliza el proceso de descubrimiento a través de una interfaz moderna e intuitiva.

---

## ✨ Características Principales

- **Recomendaciones Personalizadas**: Un modelo de machine learning que evoluciona a medida que interactúas con el sistema.
- **Calificación Interactiva**: Califica películas para mejorar la precisión de tus recomendaciones.
- **Búsqueda Inteligente**: Encuentra películas por título con resultados en tiempo real.
- **Información Detallada**: Visualiza resúmenes, años de estreno, géneros y calificaciones de cada film.
- **Descubrimiento Guiado**: Explora nuevas películas a través de secciones curadas como "Top 10" y "Recomendados".
- **Interfaz Moderna**: Frontend responsivo y animado construido con React y Framer Motion.
- **API Robusta**: Backend basado en Django REST Framework que gestiona autenticación, datos y lógica de recomendación.

---

## 🧠 Enfoque de Machine Learning

RecomendAI emplea una estrategia de **Filtrado Basado en Contenido (Content-Based Filtering)** utilizando un clasificador de **Bosques Aleatorios (Random Forest Classifier)**.

### Cómo funciona:

1.  **Extracción de Características**: El sistema extrae características clave del conjunto de datos de películas, incluyendo:
    *   **Géneros**: Procesados mediante `MultiLabelBinarizer` para manejar múltiples géneros por película.
    *   **Metadatos**: Popularidad, promedio de votos e ingresos.
2.  **Perfilado de Usuario**: Cuando un usuario indica que le gusta una película o la marca como vista, el sistema construye un perfil basado en estas interacciones.
3.  **Entrenamiento del Modelo**: Para cada solicitud de recomendación, se entrena un modelo de Random Forest "al vuelo" utilizando el historial del usuario como conjunto de entrenamiento (etiquetas: 1 si le gustó, 0 en caso contrario).
4.  **Predicción de Probabilidades**: El modelo predice la probabilidad de que al usuario le gusten las películas que aún no ha visto.
5.  **Ranking**: Las películas se ordenan por su "probabilidad de gusto" y se devuelve un subconjunto diverso al usuario.

### Librerías Utilizadas:
*   **scikit-learn**: Para el clasificador Random Forest y el preprocesamiento de datos.
*   **pandas**: Para la manipulación eficiente de datos e ingeniería de características.
*   **numpy**: Para operaciones numéricas y aleatorización.

---

## 🛠️ Stack Tecnológico

### Backend
*   **Lenguaje**: Python 3.x
*   **Framework**: Django & Django REST Framework (DRF)
*   **Base de Datos**: PostgreSQL (Soporte para SQLite en desarrollo)
*   **Librerías ML**: scikit-learn, pandas, numpy

### Frontend
*   **Framework**: React (Vite)
*   **Lenguaje**: TypeScript
*   **Estilos**: Tailwind CSS
*   **Gestión de Estado**: Redux Toolkit
*   **Animaciones**: Framer Motion, Lottie
*   **Componentes UI**: React Icons, Splide (Carruseles)

---

## 🏗️ Arquitectura del Proyecto

```text
RecomendAI_2024/
├── recommendAIApi/           # Backend Django
│   ├── App/                  # Lógica Principal de la Aplicación
│   │   ├── management/       # Comandos personalizados (ej. carga de datos)
│   │   ├── migrations/       # Migraciones de base de datos
│   │   ├── models.py         # Modelos de Usuario, Película e Interacción
│   │   ├── serializers.py    # Serializadores DRF
│   │   ├── views.py          # ViewSets y Lógica de API
│   │   └── remomendMovies_view.py # Motor de Recomendación ML
│   └── djangoProject/        # Configuración del Proyecto
└── recommendAiWeb/           # Frontend React (Vite)
    ├── src/
    │   ├── components/       # Componentes de UI reutilizables
    │   ├── pages/            # Componentes de página (Landing, Búsqueda, etc.)
    │   ├── redux/            # Lógica de gestión de estado
    │   └── assets/           # Imágenes y animaciones
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos
*   Python 3.10+
*   Node.js & npm
*   PostgreSQL (o cambiar a SQLite en la configuración)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/RecomendAI.git
cd RecomendAI
```

### 2. Configuración del Backend
```bash
cd recommendAIApi

# Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Cargar datos iniciales (requiere un archivo CSV)
python manage.py load_movies ruta/a/tus/peliculas.csv

# Iniciar el servidor
python manage.py runserver
```

### 3. Configuración del Frontend
```bash
cd ../recommendAiWeb

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

---

## 📖 Uso

### Endpoints de la API
El backend proporciona varios endpoints para interactuar con los datos:

| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Autenticación de usuario |
| `/api/recommend/<idUser>/` | `GET` | Obtener recomendaciones personalizadas |
| `/api/searchMoviesByName/` | `GET` | Buscar películas por título |
| `/api/rateMovies` | `POST` | Registrar interacción (like/vista) |
| `/api/tenmovies/<idUser>/` | `GET` | Obtener 10 películas para calificación inicial |

### Flujo de Usuario
1.  **Registro/Login**: Crea una cuenta para comenzar.
2.  **Calificación Inicial**: Califica algunas películas para que el modelo entienda tus preferencias.
3.  **Recibe Recomendaciones**: Visita tu panel para ver sugerencias personalizadas.
4.  **Busca y Descubre**: Usa la barra de búsqueda para encontrar títulos específicos o explorar géneros.

---

## 📸 Demo
<!-- Añadir capturas de pantalla aquí -->
*¡Próximamente!*

---

## 🔮 Mejoras Futuras

- [ ] **Filtrado Colaborativo**: Implementar Factorización de Matrices para sugerir películas basadas en gustos de usuarios similares.
- [ ] **Personalización Avanzada**: Incorporar metadatos de actores y directores en el modelo.
- [ ] **Modelo Híbrido**: Combinar filtrado basado en contenido y colaborativo.
- [ ] **Despliegue en la Nube**: Configurar el backend en Heroku/AWS y el frontend en Vercel/Netlify.
- [ ] **Tráilers de Películas**: Integrar la API de YouTube para mostrar tráilers directamente.

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](recommendAIApi/LICENSE) para más detalles.
