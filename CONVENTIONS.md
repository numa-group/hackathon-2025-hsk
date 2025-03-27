# Project Conventions

This document outlines the coding standards and conventions for our Next.js application with Tailwind CSS and Shadcn/UI.

## File and Directory Naming

- All files and directories should use kebab-case
  - ✅ `data-table.tsx`, `use-fetch.ts`, `auth-provider.tsx`
  - ❌ `DataTable.tsx`, `useFetch.ts`, `AuthProvider.tsx`

## Component Structure

Each component should have its own directory with the following structure:

- `index.ts`: Only for exporting the component (no implementation)
- `component.tsx`: Main component implementation
- `types.ts`: Type definitions
- `hooks.ts`: Custom hooks related to the component

Example:

```
button/
├── index.ts          # export { Button } from './button'
├── button.tsx        # Component implementation
├── types.ts          # Type definitions
└── hooks.ts          # Custom hooks
```

## Component Organization

- All application specific components should be placed in: `src/app/components/*` folder.
- All shadcn components will be placed in 'src/components/\*' folder.

## Naming Conventions

- Utility functions: camelCase
  - ✅ `formatDate`, `useLocalStorage`, `calculateTotal`
- Constants: UPPERCASE
  - ✅ `API_ENDPOINTS`, `COLOR_PALETTE`, `DEFAULT_SETTINGS`
- Components: PascalCase
  - ✅ `DataTable`, `Button`, `UserProfile`

## Export Pattern

- Only use named exports throughout the codebase
- No default exports anywhere

```tsx
// ✅ Good
export const Button = () => {...}

// ❌ Bad
const Button = () => {...}
export default Button
```

## Import Alias

- Use the `@` alias defined in tsconfig.json to import from the source directory

```tsx
// ✅ Good
import { Button } from "@/components/button";

// ❌ Bad
import { Button } from "../../../components/button";
```

## Shadcn/UI Installation

- Use `pnpm dlx shadcn-ui@latest add [component-name]` for all Shadcn component additions

## Tailwind Style Organization

- Use `cn()` from `@/lib/utils.ts` for className composition
- Organize Tailwind classes in the following order:
  1. Layout styles (flex, grid, positioning, sizing)
  2. Visual styles (colors, borders, shadows)
  3. Interactive states and responsive variants

```tsx
// ✅ Good
<div className={cn(
  "flex items-center justify-between w-full h-12", // Layout
  "bg-white border rounded-lg shadow-sm", // Visual
  "hover:bg-gray-50 sm:w-auto lg:h-16" // States & responsive
)}>
```

## Responsive Design

- Mobile-first approach for all components and layouts
- Use only these Tailwind breakpoints:
  - Default (mobile): 0-639px
  - sm (tablet): 640px+
  - lg (desktop): 1024px+
- Use viewport media queries for layout-level responsiveness
- Use container queries for component-level responsiveness when appropriate

## Animation Standards

- Use Motion for all animations. (motion/react package)
- For simpler ones use CSS transitions.
- Use what might be more simpler and efficient for the specific use case.

## Icon System

- Use Lucide icons library throughout the application
- Maintain consistent icon sizes within related UI elements

## State Management

- Use local component state (useState/useReducer) for component-specific state
- Use Context API for global/shared state
- No Redux or other state management libraries without explicit approval

## Library Restrictions

- Core libraries: Next.js, React, Tailwind CSS, Shadcn/UI, Framer Motion, Lucide
- No additional libraries should be introduced without explicit approval
- All components should be built using only these approved libraries
