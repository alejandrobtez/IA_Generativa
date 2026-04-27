# ── Stage 1: Build React frontend ──────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci --quiet
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python runtime ─────────────────────────────────────────────────────
FROM python:3.11-slim AS production
WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-build /build/dist ./frontend/dist

RUN mkdir -p backend/uploads backend/data

EXPOSE 8000
CMD ["sh", "-c", "cd /app/backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
