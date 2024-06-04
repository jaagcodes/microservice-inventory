## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Development flow

```bash
# Create migration
$ npm run migration:generate -- -n InitialMigration

# Run migration
$ npm run migration:up

# Create seeder
$ npx mikro-orm seeder:create DatabaseSeeder

# Run seeder
$ npx mikro-orm seeder:run --class=DatabaseSeeder

# Run redis
$ podman run -d --name redis -p 6379:6379 redis:latest
```
