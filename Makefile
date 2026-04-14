.PHONY: help install setup migrate run scrape insights index clean db-setup db-drop backend frontend test check

SHELL := /bin/bash
VENV := venv
PYTHON := ./$(VENV)/bin/python
PIP := ./$(VENV)/bin/pip
NPM := npm

# Color output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)Book Insight Platform - Available Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Setup & Installation:$(NC)"
	@echo "  make install          Install all dependencies (backend + frontend)"
	@echo "  make setup            Complete setup (database + dependencies + migrations)"
	@echo "  make db-setup         Create MySQL database and user"
	@echo "  make db-drop          Drop MySQL database (careful!)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make migrate          Run Django migrations"
	@echo "  make backend          Run Django development server (port 8000)"
	@echo "  make frontend         Run React Vite dev server (port 5173)"
	@echo "  make run              Run both backend and frontend (requires 2 terminals)"
	@echo ""
	@echo "$(GREEN)Data Management:$(NC)"
	@echo "  make scrape           Scrape books from books.toscrape.com (default: 2 pages)"
	@echo "  make scrape-full      Scrape full catalog (50 pages, ~1000 books)"
	@echo "  make insights         Generate AI insights for all books"
	@echo "  make insight-single   Generate insights for single book (ID=1 by default)"
	@echo "  make index            Build ChromaDB vector index"
	@echo ""
	@echo "$(GREEN)Testing & Validation:$(NC)"
	@echo "  make check            Run Django system checks"
	@echo "  make test-api         Test sample API endpoints"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean            Clean up cache and temp files"
	@echo "  make clean-all        Clean cache, temp, and node_modules"
	@echo "  make status           Show database and deployment status"
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make setup            # First time setup"
	@echo "  make migrate          # After pulling new code"
	@echo "  make scrape           # Quick scrape test"
	@echo "  make run              # Development (2 terminals)"

# ============================================================================
# INSTALLATION & SETUP
# ============================================================================

install: install-backend install-frontend
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

install-backend:
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && pip install -r requirements.txt
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"

install-frontend:
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	@cd frontend && $(NPM) install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

setup: db-setup migrate install
	@echo "$(BLUE)Building vector index...$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && python manage.py build_index --all
	@echo "$(GREEN)✓ Setup complete! Run 'make run' to start the application$(NC)"

# ============================================================================
# DATABASE SETUP
# ============================================================================

db-setup:
	@echo "$(BLUE)Creating MySQL database and user...$(NC)"
	@mysql -u root -e "CREATE DATABASE IF NOT EXISTS book_insight CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" && \
	mysql -u root -e "CREATE USER IF NOT EXISTS 'bookuser'@'localhost' IDENTIFIED BY 'bookpass';" && \
	mysql -u root -e "GRANT ALL PRIVILEGES ON book_insight.* TO 'bookuser'@'localhost';" && \
	mysql -u root -e "FLUSH PRIVILEGES;" && \
	echo "$(GREEN)✓ Database created$(NC)" || echo "$(RED)Failed to create database$(NC)"

db-drop:
	@echo "$(YELLOW)⚠ WARNING: This will delete the book_insight database!$(NC)"
	@read -p "Are you sure? Type 'yes' to confirm: " confirm && \
	if [ "$$confirm" = "yes" ]; then \
		mysql -u root -e "DROP DATABASE IF EXISTS book_insight;" && \
		echo "$(GREEN)✓ Database dropped$(NC)"; \
	else \
		echo "Cancelled"; \
	fi

db-shell:
	@echo "Opening MySQL shell..."
	@mysql -u bookuser -pbookpass book_insight

# ============================================================================
# MIGRATIONS & DJANGO
# ============================================================================

migrate:
	@echo "$(BLUE)Running Django migrations...$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && python manage.py makemigrations books chat insights
	@cd backend && source ../$(VENV)/bin/activate && python manage.py migrate
	@echo "$(GREEN)✓ Migrations applied$(NC)"

check:
	@echo "$(BLUE)Running Django system checks...$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && python manage.py check
	@echo "$(GREEN)✓ All checks passed$(NC)"

# ============================================================================
# RUNNING THE APPLICATION
# ============================================================================

backend:
	@echo "$(BLUE)Starting Django development server (http://localhost:8000)...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && python manage.py runserver

frontend:
	@echo "$(BLUE)Starting React development server (http://localhost:5173)...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@cd frontend && $(NPM) run dev

run:
	@echo "$(YELLOW)Starting both services...$(NC)"
	@echo "$(BLUE)Backend: http://localhost:8000$(NC)"
	@echo "$(BLUE)Frontend: http://localhost:5173$(NC)"
	@echo "$(BLUE)Swagger UI: http://localhost:8000/api/docs/$(NC)"
	@echo "$(YELLOW)Run in separate terminals or use: make backend & make frontend$(NC)"

# ============================================================================
# DATA MANAGEMENT
# ============================================================================

scrape:
	@echo "$(BLUE)Scraping books (2 pages)...$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && python manage.py scrape_books --max-pages 2
	@echo "$(GREEN)✓ Scraping complete$(NC)"

scrape-full:
	@echo "$(BLUE)Scraping full catalog (50 pages, this may take 20-30 minutes)...$(NC)"
	@read -p "Continue? (y/n) " -n 1 -r && \
	echo && \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd backend && source ../$(VENV)/bin/activate && python manage.py scrape_books; \
		echo "$(GREEN)✓ Full scrape complete$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

insights:
	@echo "$(BLUE)Generating AI insights for all books...$(NC)"
	@echo "$(YELLOW)This requires Groq API key and will take time$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && python manage.py generate_insights --all
	@echo "$(GREEN)✓ Insights generation complete$(NC)"

insight-single:
	@echo "$(BLUE)Generating insights for book ID=$(ID)...$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && python manage.py generate_insights --book-id $(ID)
	@echo "$(GREEN)✓ Insight generated$(NC)"

index:
	@echo "$(BLUE)Building ChromaDB vector index...$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && python manage.py build_index --all
	@echo "$(GREEN)✓ Vector index built$(NC)"

# ============================================================================
# TESTING & VALIDATION
# ============================================================================

test-api:
	@echo "$(BLUE)Testing API endpoints...$(NC)"
	@echo ""
	@echo "$(YELLOW)1. Testing /api/books/ endpoint:$(NC)"
	@curl -s http://localhost:8000/api/books/ | head -n 50
	@echo ""
	@echo "$(YELLOW)2. Testing /api/docs/ endpoint:$(NC)"
	@curl -s -I http://localhost:8000/api/docs/ | head -n 1
	@echo "$(GREEN)✓ API tests complete$(NC)"

# ============================================================================
# MAINTENANCE & UTILITIES
# ============================================================================

clean:
	@echo "$(BLUE)Cleaning cache and temporary files...$(NC)"
	@find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@find frontend -type d -name node_modules -prune -o -type d -name .vite -exec rm -rf {} + 2>/dev/null || true
	@rm -rf backend/.pytest_cache backend/.coverage 2>/dev/null || true
	@echo "$(GREEN)✓ Clean complete$(NC)"

clean-all: clean
	@echo "$(BLUE)Removing frontend node_modules...$(NC)"
	@rm -rf frontend/node_modules
	@echo "$(GREEN)✓ Full clean complete$(NC)"

status:
	@echo "$(BLUE)System Status:$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend:$(NC)"
	@cd backend && source ../$(VENV)/bin/activate && python manage.py check 2>/dev/null && echo "  ✓ Django OK" || echo "  ✗ Django ERROR"
	@test -f backend/.env && echo "  ✓ .env configured" || echo "  ✗ .env missing"
	@echo ""
	@echo "$(YELLOW)Database:$(NC)"
	@mysql -u bookuser -pbookpass book_insight -e "SELECT COUNT(*) as books FROM books_book;" 2>/dev/null && echo "  ✓ MySQL connected" || echo "  ✗ MySQL not accessible"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)"
	@test -d frontend/node_modules && echo "  ✓ Dependencies installed" || echo "  ✗ Dependencies not installed"
	@test -f frontend/src/App.jsx && echo "  ✓ App code present" || echo "  ✗ App code missing"

shell:
	@cd backend && source ../$(VENV)/bin/activate && python manage.py shell

# ============================================================================
# DEVELOPMENT SHORTCUTS
# ============================================================================

fresh: clean db-drop db-setup migrate scrape
	@echo "$(GREEN)✓ Fresh installation complete!$(NC)"

show-books:
	@cd backend && source ../$(VENV)/bin/activate && python manage.py shell -c "from books.models import Book; books = Book.objects.all()[:10]; print(f'Total: {Book.objects.count()}'); [print(f'{i+1}. {b.title} ({b.rating}/5)') for i, b in enumerate(books)]"

show-env:
	@echo "$(BLUE)Current Environment:$(NC)"
	@cat backend/.env

admin-user:
	@echo "$(BLUE)Creating Django admin user...$(NC)"
	@cd backend && $(PYTHON) manage.py createsuperuser

logs:
	@echo "$(BLUE)Tailing recent logs...$(NC)"
	@tail -f /tmp/django.log 2>/dev/null || echo "No logs available"

.DEFAULT_GOAL := help
