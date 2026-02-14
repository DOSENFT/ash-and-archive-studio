# Contributing to Ash & Archive: The Studio

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building something for the tabletop RPG community, and that spirit of collaboration should extend to our development process.

## Getting Started

1. **Fork the repository** and clone your fork locally
2. **Install dependencies:** `npm install`
3. **Start the dev server:** `npm run dev`
4. **Create a branch** for your changes: `git checkout -b feature/your-feature-name`

## Development Guidelines

### Code Style

- We use **TypeScript** for type safety
- Follow the existing code patterns in the codebase
- Use **functional components** with hooks
- Prefer **named exports** over default exports for components
- Use **Tailwind CSS** for styling—avoid custom CSS unless necessary

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `HeroSection.tsx` |
| Hooks | camelCase with `use` prefix | `useEmberParticles.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PARTICLES` |
| CSS Classes | kebab-case (Tailwind) | `glass-card` |

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react'

// 2. Types/Interfaces
interface Props {
  title: string
}

// 3. Component
export function MyComponent({ title }: Props) {
  // 4. Hooks
  const [state, setState] = useState(false)

  // 5. Handlers
  const handleClick = () => setState(true)

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
    </div>
  )
}
```

### Accessibility Requirements

All contributions must maintain WCAG 2.2 AA compliance:

- Ensure color contrast ratios meet 4.5:1 minimum
- Provide keyboard navigation for all interactive elements
- Include appropriate ARIA labels and landmarks
- Respect `prefers-reduced-motion` for animations
- Maintain 44x44px minimum touch targets

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new training module component
fix: resolve carousel autoplay on mobile
docs: update README with new setup instructions
style: format code with prettier
refactor: simplify particle animation logic
test: add unit tests for pricing calculator
chore: update dependencies
```

## Pull Request Process

1. **Update documentation** if you're adding new features
2. **Add tests** for new functionality
3. **Run linting:** `npm run lint`
4. **Test across breakpoints:** 360px, 768px, 1024px, 1440px
5. **Fill out the PR template** completely
6. **Request review** from maintainers

## Design System

When contributing UI changes, refer to the design tokens in `tailwind.config.js`:

### Colors
- Use semantic color names: `arcane`, `ember`, `verdant`, `eldritch`
- Background scale: `void-0` (darkest) → `void-2` (lightest)
- Text scale: `forge-0` (primary) → `forge-2` (muted)

### Typography
- Display text: `font-display` (Space Grotesk)
- Body text: `font-body` (IBM Plex Sans)
- Monospace: `font-mono` (JetBrains Mono)

### Motion
- Use the `ease-forge` timing function
- Respect duration tokens: `duration-fast`, `duration-base`, `duration-enter`, `duration-complex`

## Questions?

Open an issue with the `question` label and we'll help you out!
