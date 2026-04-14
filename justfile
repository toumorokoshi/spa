# Development commands for spa

# Run all linting and formatting checks
lint:
    npx prettier --check .
    npm run lint

# Automatically fix linting and formatting issues
fix:
    npm run format
    npx eslint . --fix

# Run tests
test:
    npm run test

# Start development server
dev:
    npm run dev

# Build for production
build:
    npm run build
