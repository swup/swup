# Agents

This file provides context for AI coding agents working on the swup codebase.

## Project Overview

**swup** is a versatile and extensible page transition library for server-rendered websites. It manages the complete page load lifecycle, animates between pages, and provides features like caching, smart preloading, native browser history support, and enhanced accessibility.

- **Repository**: [swup/swup](https://github.com/swup/swup)
- **Documentation**: [swup.js.org](https://swup.js.org)
- **License**: MIT

## Tech Stack

- **Language**: TypeScript
- **Build Tool**: microbundle
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky

## Project Structure

```
src/
├── Swup.ts          # Main Swup class
├── index.ts         # Public exports
├── helpers.ts       # Re-exports from helpers/
├── utils.ts         # Re-exports from utils/
├── config/
│   └── version.ts   # Library version
├── helpers/         # Helper functions (classify, delegateEvent, Location, etc.)
├── modules/         # Core modules (Cache, Hooks, Visit, navigation, animations, etc.)
└── utils/           # Utility functions

tests/
├── config/          # Test configuration (vitest, playwright)
├── fixtures/        # HTML fixtures for E2E tests
├── functional/      # Playwright E2E tests
├── unit/            # Vitest unit tests
└── support/         # Test utilities and commands
```

## Common Commands

```bash
# Development
npm run dev          # Watch mode with modern output

# Building
npm run build        # Build all formats (module + bundle)
npm run clean        # Remove dist folder

# Linting
npm run lint         # Run both TypeScript and ESLint checks
npm run lint:ts      # Type check only
npm run lint:es      # ESLint only
npm run format       # Auto-fix lint issues

# Testing
npm run test         # Run all tests (unit + e2e)
npm run test:unit    # Run unit tests
npm run test:unit:watch  # Run unit tests in watch mode
npm run test:e2e     # Run E2E tests
npm run test:e2e:dev # Run E2E tests with UI
```

## Architecture

### Core Concepts

1. **Visit**: Represents a single page navigation with all its state (from/to URLs, trigger, scroll positions, animation settings)

2. **Hooks**: Event system for the page load lifecycle. Hooks can be sync or async, and handlers can modify visit behavior.

3. **Cache**: In-memory page cache storing fetched HTML for faster subsequent visits

4. **Classes**: Manages animation CSS classes on the document during transitions

5. **Plugins**: Extend swup functionality. Plugins have `mount()` and `unmount()` lifecycle methods.

### Page Load Lifecycle

1. Link click or `navigate()` call triggers a visit
2. `visit:start` hook fires
3. Page is fetched (or retrieved from cache)
4. Out-animation plays (`animation:out:start` → `animation:out:await` → `animation:out:end`)
5. Content is replaced
6. In-animation plays (`animation:in:start` → `animation:in:await` → `animation:in:end`)
7. `visit:end` hook fires

### Key Files

- [src/Swup.ts](src/Swup.ts) - Main class with options, initialization, and public API
- [src/modules/Hooks.ts](src/modules/Hooks.ts) - Hook system implementation
- [src/modules/Visit.ts](src/modules/Visit.ts) - Visit state management
- [src/modules/navigate.ts](src/modules/navigate.ts) - Navigation logic
- [src/modules/Cache.ts](src/modules/Cache.ts) - Page cache implementation

## Code Style

- Use TypeScript strict mode
- Prefer named exports except for the main Swup class
- Use JSDoc comments for public APIs
- Follow existing patterns for hooks and modules
- Keep the core small; add features via plugins

## Testing Guidelines

- Unit tests go in `tests/unit/` with `.test.ts` extension
- E2E tests go in `tests/functional/` with `.spec.ts` extension
- Use fixtures in `tests/fixtures/` for E2E test pages
- E2E tests use a custom `swup` fixture that provides helpers

## Dependencies

- **delegate-it**: Event delegation
- **path-to-regexp**: URL path matching
