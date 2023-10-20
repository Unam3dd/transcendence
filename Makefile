all:
	@echo "COMMAND:                \t| DESCRIPTION:"
	@echo "	up                     \t| up prod docker compose"
	@echo "	up_dev                 \t| up dev docker compose"
	@echo "	stop                   \t| stop docker compose"
	@echo "	down                   \t| down docker compose"
	@echo "	build                  \t| build docker compose"
	@echo "	build_dev              \t| build dev docker compose"
	@echo "	rm                     \t| rm dist directories & volumes"
	@echo "	lint                   \t| relint NestJS backend?"
	@echo "	format                 \t| reformat NestJS backend"
	@echo "	re                     \t| stop + down + rm + lint + up_dev"
	@echo "	snyk_<backend/frontend>\t| Check Vulnerabilities backend/frontend"
	@echo " update				   \t| Update Package.JSON backend/frontend"
	@echo " update_interactive     \t| Update Package.JSON with interactive mode backend/frontend"

up: lint format front_lint
	@docker compose -f docker-compose.yml up --build

up_dev: lint format front_lint
	@docker compose -f docker-compose-dev.yml up --build
	@echo "Transcandance has been stopped !"

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

build: lint format front_lint
	@docker compose -f docker-compose.yml build

build_dev: lint format front_lint
	@docker compose -f docker-compose-dev.yml build

lint:
	@cd backend && npm run lint

format:
	@cd backend && npm run format

front_lint:
	@cd frontend && npm run lint

front_fix:
	@cd frontend && npm run lintfix

test:
	@docker compose -f docker-compose-test.yml up --build
	@docker compose -f docker-compose-test.yml stop
	@docker compose -f docker-compose-test.yml down

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

ncu:
	@npm install -g npm-check-updates

update_backend:
	@cd backend && ncu && ncu -u && npm install --save

update_frontend:
	@cd frontend && ncu && ncu -u && npm install --save

update_manualy:
	@cd frontend && npm install --save --legacy-peer-deps

update_interactive_frontend:
	@cd frontend && ncu -i --format group && npm install --save --legacy-peer-deps

update_interactive_backend:
	@cd backend && ncu -i --format group && npm install --save

update_interactive: update_interactive_frontend update_interactive_backend

update: update_backend update_frontend

.PHONY: all dev stop down build build_dev lint format test re snyk
