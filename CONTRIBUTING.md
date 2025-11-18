# Contributing to Personal Life Log Orchestrator

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Workflow

1. **Fork and clone**
   ```bash
   git clone https://github.com/your-username/personal-life-log-orchestrator.git
   cd personal-life-log-orchestrator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Use Prettier (integrated with ESLint)
- **Linting**: Run `npm run lint` before committing
- **Type checking**: Run `npm run type-check`

## Testing

- Write tests for new features
- Maintain test coverage
- Run tests: `npm test`
- Test utilities in `src/lib/__tests__/`
- Test routers in `src/server/routers/__tests__/`

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Write/update tests
4. Run tests and linting
5. Commit with clear messages
6. Push and create a PR

## Commit Messages

Follow conventional commits:
- `feat: add expense tracking`
- `fix: resolve date formatting issue`
- `docs: update README`
- `test: add tests for notes router`
- `refactor: simplify error handling`

## Adding New Features

### New Event Type

1. Add type to EventLog schema
2. Create import script if needed
3. Update UI to display new type
4. Add tests

### New Integration

1. Create integration module in `src/lib/`
2. Add environment variables
3. Document in README
4. Add error handling

### New AI Feature

1. Add function in `src/lib/openai.ts`
2. Create tRPC endpoint
3. Add UI component
4. Update documentation

## Questions?

Open an issue for discussion before starting major changes.
