.PHONY: install
install:
	npm i

.PHONY: build
build:
	npm run build

.PHONY: lint
lint:
	npm run lint

.PHONY: prettier
prettier:
	npm run prettier

.PHONY: run
run:
	npm run start

.PHONY: run-dev
run-dev:
	npm run start-dev

.PHONY: migrate
migrate:
	npx prisma migrate dev --name init

.PHONY: migrate-prod
migrate-prod:
	npx prisma migrate deploy

.PHONY: prisma-ui
prisma-ui:
	npx prisma studio

.PHONY: seed
seed:
	npx prisma db seed

.PHONY: format
format:
	npx prisma format
