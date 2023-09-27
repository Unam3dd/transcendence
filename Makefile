all:
	@echo "COMMAND:	| DESCRIPTION:"
	@echo "up		| up prod docker compose"
	@echo "up_dev		| up dev docker compose"
	@echo "stop		| stop docker compose"
	@echo "down		| down docker compose"
	@echo "build		| build docker compose"
	@echo "build_dev	| build dev docker compose"
	@echo "rm		| rm dist directories & volumes"
	@echo "lint		| relint NestJS backend?"
	@echo "format		| reformat NestJS backend"
	@echo "re		| stop + down + rm + lint + up_dev"

up:
	@docker compose -f docker-compose.yml up --build

up_dev:
	@docker compose -f docker-compose-dev.yml up --build

stop:
	@docker compose stop
	@docker compose -f snyk.yaml stop

down:
	@docker compose down --rmi all
	@docker compose -f snyk.yaml down --rmi all

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

snyk:
	@sudo docker compose -f ./snyk.yaml up --build
	@sudo docker compose -f ./snyk.yaml stop
	@sudo docker compose -f ./snyk.yaml down

.PHONY: all dev stop down build build_dev lint format re snyk
