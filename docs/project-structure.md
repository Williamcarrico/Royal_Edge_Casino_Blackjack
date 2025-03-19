# Royal Edge Casino Blackjack - Project Structure

## Overview

The project uses a feature-based architecture to organize code by domain rather than by technical concerns. This provides better separation of concerns, improves maintainability, and makes it easier to understand and navigate the codebase.

## Directory Structure

```
src/
 ├── app/                    # Next.js App Router pages
 ├── components/             # Shared components
 │   ├── ui/                 # Basic UI components
 │   └── layout/             # Layout components
 ├── features/               # Feature-based modules
 │   ├── game/               # Game-specific components and logic
 │   │   ├── components/     # Game UI components
 │   │   ├── hooks/          # Game-specific hooks
 │   │   ├── store/          # Game state management
 │   │   └── utils/          # Game-specific utilities
 │   ├── betting/            # Betting-related functionality
 │   └── user/               # User-related functionality
 ├── hooks/                  # Shared hooks
 ├── lib/                    # Shared utilities and functions
 ├── store/                  # Global state management
 ├── styles/                 # Global styles
 ├── types/                  # TypeScript type definitions
 ├── services/               # External service integrations
 ├── docs/                   # Project documentation
 └── tests/                  # Test files
```

## Features

Features are domain-specific modules that group related functionality together. Each feature can include:

- **Components**: UI components specific to the feature
- **Hooks**: React hooks for managing feature-specific logic
- **Store**: State management (using Zustand) for the feature
- **Utils**: Utility functions specific to the feature

## Components

The `components` directory contains shared components used across features:

- **UI Components**: Basic UI elements like buttons, inputs, and dialogs
- **Layout Components**: Page layout elements like headers, footers, and navigation

## Importing

We use a consistent import pattern to make it clear where code is coming from:

```typescript
// Feature imports
import { BlackjackGame } from '@/features/game';
import { placeBet } from '@/features/betting';

// Shared component imports
import { Button } from '@/components/ui';
import { MainLayout } from '@/components/layout';

// Shared utilities
import { formatCurrency } from '@/lib/utils';
```

## Adding New Features

When adding a new feature:

1. Create a new directory under `src/features/`
2. Add the appropriate subdirectories (components, hooks, store, utils)
3. Create an `index.ts` file to export the feature's public API

## Migration

The project was restructured from a flat structure to this feature-based architecture. The migration process included:

1. Creating the feature directories
2. Moving files to their appropriate locations
3. Updating import paths using the `npm run update-imports` script
4. Testing to ensure everything works correctly

## Best Practices

- Keep feature code isolated within its directory
- Use the shared components for UI elements used across features
- Export feature APIs through index files
- Follow the established naming and coding conventions