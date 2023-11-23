all:
	@echo "┌──────────────────────────┬─────────────────────────────────────────┐"
	@echo "│ COMMAND:                 │ DESCRIPTION:                            │"
	@echo "│ up                       │ up prod docker compose                  │"
	@echo "│ up_dev                   │ up dev docker compose                   │"
	@echo "│ stop                     │ stop docker compose                     │"
	@echo "│ down                     │ down docker compose                     │"
	@echo "│ build                    │ build docker compose                    │"
	@echo "│ build_dev                │ build dev docker compose                │"
	@echo "│ rm                       │ rm dist directories & volumes           │"
	@echo "│ lint                     │ relint NestJS                           │"
	@echo "│ format                   │ reformat NestJS                         │"
	@echo "│ re                       │ stop + down + rm + lint + up_dev        │"
	@echo "│ snyk_<backend/frontend>  │ Check Vulnerabilities backend/frontend  │"
	@echo "└──────────────────────────┴─────────────────────────────────────────┘"
up:
	@docker compose -f docker-compose.yml up --build

up_dev:
	@docker compose -f docker-compose-dev.yml up --build
	@echo "Transcendence has been stopped !"

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

re:
	@sudo make stop down rm format lint up_dev

snyk_backend:
	@docker compose -f ./snyk.yaml run snyk_backend
	@docker compose -f ./snyk.yaml stop
	@docker compose -f ./snyk.yaml down

snyk_frontend:
	@docker compose -f ./snyk.yaml run snyk_frontend
	@docker compose -f ./snyk.yaml stop
	@docker compose -f ./snyk.yaml down

damok: stop down rm
	@cd backend && npm install --save --legacy-peer-deps
	@cd frontend && npm install --save --legacy-peer-deps

.PHONY: all up up_dev stop down build build_dev re snyk damok
