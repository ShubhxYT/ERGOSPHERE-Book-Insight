# =============================================================================
# Stage 1: Build React frontend
# =============================================================================
FROM node:20-alpine AS node-builder

WORKDIR /app/frontend

# Install dependencies first (better layer caching)
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --prefer-offline

# Copy source and build
COPY frontend/ .
RUN npm run build


# =============================================================================
# Stage 2: Production image (Python + Nginx + Supervisor + Chromium)
# =============================================================================
FROM python:3.11-slim AS app

# Prevents python from writing .pyc files and enables unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Gunicorn worker count (override via env)
    GUNICORN_WORKERS=2 \
    # Tell Django to collect statics at startup
    COLLECT_STATIC=true \
    # Chromium for Selenium inside the container
    CHROME_BIN=/usr/bin/chromium \
    CHROMEDRIVER_PATH=/usr/bin/chromedriver \
    # Prevent Selenium from downloading its own driver
    SE_DRIVER_MANAGER_DISABLED=1

# ---------------------------------------------------------------------------
# System dependencies
# ---------------------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Web server & process manager
    nginx \
    supervisor \
    # Chromium for Selenium scraper
    chromium \
    chromium-driver \
    # C compiler + build tools (required by some pip wheels)
    gcc \
    build-essential \
    # PostgreSQL client headers (psycopg2-binary pre-built, but just in case)
    libpq-dev \
    # MySQL client headers (mysqlclient)
    default-libmysqlclient-dev \
    pkg-config \
    # Misc
    curl \
    ca-certificates \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# Python dependencies
# ---------------------------------------------------------------------------
WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ---------------------------------------------------------------------------
# Application source
# ---------------------------------------------------------------------------
COPY backend/ .

# Copy built React frontend
COPY --from=node-builder /app/frontend/dist /app/frontend/dist

# ---------------------------------------------------------------------------
# Configuration files
# ---------------------------------------------------------------------------
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Remove default nginx site
RUN rm -f /etc/nginx/sites-enabled/default

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Supervisor log directory
RUN mkdir -p /var/log/supervisor

# ---------------------------------------------------------------------------
# Startup entrypoint
# ---------------------------------------------------------------------------
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create writable dirs for Django runtime data (volumes can override these)
RUN mkdir -p /app/backend/staticfiles \
             /app/backend/chroma_db \
             /tmp/django_cache

# ---------------------------------------------------------------------------
# Expose & run
# ---------------------------------------------------------------------------
EXPOSE 80

# entrypoint.sh runs migrations / optional init, then starts supervisord
CMD ["/entrypoint.sh"]
