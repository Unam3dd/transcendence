all:
	@echo "command		| description"
	@echo "up		| up prod docker compose"
	@echo "up_dev		| up dev docker compose"
	@echo "stop		| stop docker compose"
	@echo "down		| down docker compose"
	@echo "build		| build docker compose"
	@echo "build_dev	| build dev docker compose"

up:
	@docker compose -f docker-compose.yml up --build

up_dev:
	@docker compose -f docker-compose-dev.yml up --build

stop:
	@docker compose stop

down:
	@docker compose down --rmi all

rm:
	@rm -rf backend/dist
	@rm -rf frontend/dist
	@rm -rf volumes

build:
	@docker compose -f docker-compose.yml build

build_dev:
	@docker compose -f docker-compose-dev.yml build

lint:
	@cd backend && npm run lint

format:
	@cd backend && npm run format

re:
	@sudo make stop down rm format lint up_dev

.PHONY: all dev stop down build build_dev lint format re