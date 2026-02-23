.PHONY: help setup up down restart logs clean rebuild db-connect db-backup db-restore

DOCKER_COMPOSE = docker-compose -f .devcontainer/docker-compose.yml
PROJECT_NAME = tests-maps

help:
	@echo "╔═════════════════════════════════════════════════════════════╗"
	@echo "║          Tests Maps - Development Environment              ║"
	@echo "╚═════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "  Setup & Infrastructure:"
	@echo "    make setup           - Configure and start development environment"
	@echo "    make up              - Start all containers"
	@echo "    make down            - Stop all containers"
	@echo "    make restart         - Restart all containers"
	@echo "    make logs            - View container logs"
	@echo "    make rebuild         - Rebuild Docker images"
	@echo "    make clean           - Remove containers and volumes"
	@echo ""
	@echo "  Database:"
	@echo "    make db-connect      - Connect to PostgreSQL"
	@echo "    make db-backup       - Backup database to file"
	@echo "    make db-restore      - Restore database from file"
	@echo ""
	@echo "  Development:"
	@echo "    make dev             - Start Next.js development server"
	@echo "    make build           - Build Next.js project"
	@echo "    make lint            - Run ESLint"
	@echo ""
	@echo "  Services:"
	@echo "    make nextjs-url      - Show Next.js URL"
	@echo "    make db-url          - Show Database URL"
	@echo "    make tiles-url       - Show Tile Server URL"

setup: build up
	@echo "✅ Development environment is ready!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Open VS Code and select 'Reopen in Container'"
	@echo "2. Wait for extensions to install"
	@echo "3. Run: npm install"

build:
	@echo "🔨 Building Docker images..."
	$(DOCKER_COMPOSE) build

up:
	@echo "🚀 Starting containers..."
	$(DOCKER_COMPOSE) up -d
	@echo ""
	@echo "📋 Container status:"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "⏳ Waiting for database to be healthy..."
	@sleep 5
	@$(DOCKER_COMPOSE) exec -T db pg_isready -U postgres > /dev/null && echo "✅ Database is ready"

down:
	@echo "🛑 Stopping containers..."
	$(DOCKER_COMPOSE) down

restart: down up
	@echo "🔄 Containers restarted"

logs:
	$(DOCKER_COMPOSE) logs -f

clean:
	@echo "🗑️  Removing containers and volumes..."
	$(DOCKER_COMPOSE) down -v
	@echo "✅ Clean complete"

rebuild: clean build up
	@echo "✅ Rebuild complete"

db-connect:
	$(DOCKER_COMPOSE) exec db psql -U postgres -d tilemaps

db-backup:
	@echo "💾 Creating database backup..."
	@mkdir -p ./backups
	@$(DOCKER_COMPOSE) exec -T db pg_dump -U postgres -d tilemaps > ./backups/tilemaps_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in ./backups/"

db-restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make db-restore FILE=./backups/backup_file.sql"; \
		exit 1; \
	fi
	@echo "↩️  Restoring database from $(FILE)..."
	@cat $(FILE) | $(DOCKER_COMPOSE) exec -T db psql -U postgres -d tilemaps
	@echo "✅ Database restored"

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

nextjs-url:
	@echo "🌐 Next.js: http://localhost:3000"

db-url:
	@echo "🐘 PostgreSQL: postgresql://postgres:postgres@localhost:5432/tilemaps"

tiles-url:
	@echo "🗺️  Tile Server: http://localhost:7800"

ps:
	$(DOCKER_COMPOSE) ps

shell:
	$(DOCKER_COMPOSE) exec app bash
