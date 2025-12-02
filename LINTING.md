# ESLint and Prettier Configuration

## Overview

Added modern ESLint and Prettier setup with flat config to the BPJS chatbot project.

## Files Created

### ESLint Configuration
- **eslint.config.js** - Modern flat config with TypeScript support
  - Uses `@eslint/js` and `typescript-eslint`
  - Integrated with Prettier via `eslint-plugin-prettier`
  - Reasonable rules (not too strict)

### Prettier Configuration
- **.prettierrc** - Formatting rules
  - Single quotes
  - 2-space indentation
  - 100 character line width
  - ES5 trailing commas
  
- **.prettierignore** - Ignore patterns

## Package Scripts

Added to `package.json`:

```json
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "type-check": "tsc --noEmit"
}
```

## ESLint Rules

Configured with balanced rules:

- **TypeScript**
  - Unused vars: warn (with `_` prefix ignore)
  - Explicit any: warn
  - Non-null assertion: warn
  
- **General**
  - Console allowed (for server logs)
  - Prefer const: warn
  - No var: error

## Dependencies Installed

```
eslint
@eslint/js
@types/eslint__js
typescript-eslint
prettier
eslint-config-prettier
eslint-plugin-prettier
```

## Usage

```bash
# Check for lint errors
pnpm lint

# Auto-fix lint errors
pnpm lint:fix

# Format all files
pnpm format

# Check formatting
pnpm format:check

# Type check
pnpm type-check
```

## Status

✅ All configuration files created
✅ Dependencies installed
✅ Code formatted with Prettier
✅ No strict rules that would block development
✅ Ready for use
