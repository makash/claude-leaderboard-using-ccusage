.PHONY: help setup dev build start lint db-push db-migrate db-seed db-studio docker-up docker-down clean

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## First-time project setup (install deps, setup db, seed)
	npm install
	cp -n .env.example .env || true
	npx prisma generate
	npx prisma db push
	npm run db:seed
	@echo "\n✅ Setup complete! Run 'make dev' to start."

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm run start

lint: ## Run linter
	npm run lint

db-push: ## Sync Prisma schema to database
	npx prisma db push

db-migrate: ## Create a new migration
	npx prisma migrate dev

db-seed: ## Seed database with sample data
	npm run db:seed

db-studio: ## Open Prisma Studio GUI
	npm run db:studio

docker-up: ## Start all services with Docker
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

clean: ## Remove node_modules and build artifacts
	rm -rf node_modules .next
	@echo "Cleaned. Run 'make setup' to reinstall."
