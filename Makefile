.PHONY: up down clean logs ps test dev-db dev-api dev-web

up:          
	docker compose up --build -d
	@echo "Web: http://localhost:$${WEB_PORT:-3000}  API docs: http://localhost:$${API_PORT:-8001}/docs"

down:     
	docker compose down

clean:      
	docker compose down -v

logs:
	docker compose logs -f backend frontend

ps:
	docker compose ps

test:       
	docker compose up -d db
	cd backend && uv run pytest -q

dev-db:      
	docker compose up -d db

dev-api:    
	cd backend && SAFESTEP_DATABASE_URL=postgresql+asyncpg://safestep:safestep@localhost:$${DB_PORT:-5433}/safestep uv run uvicorn app.main:app --reload --port 8001

dev-web:    
	cd frontend && npm run dev
