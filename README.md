<p align="center">
  <img src="https://via.placeholder.com/120x120/070b10/f4b545?text=A%26A" alt="Ash & Archive Logo" width="120" height="120" />
</p>

<h1 align="center">Ash & Archive: The Studio</h1>

<p align="center">
  <strong>Where Dungeon Masters Are Forged</strong>
</p>

<p align="center">
  Elite training. Legendary world-building. The complete studio for DMs who refuse to be ordinary.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#design-system">Design System</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## Overview

**Ash & Archive: The Studio** is a revolutionary D&D DM training and world-building application designed to transform novice Dungeon Masters into elite-level storytellers through professional training methodologies borrowed from the world's finest drama schools.

### Brand Meaning

- **Ash** — The forge, fire, creation, transformation
- **Archive** — The canon, the lore, accumulated wisdom
- **The Studio** — A professional creative space where masters train and create

---

## Features

### 🌍 World Building Engine
Build worlds that feel alive with interactive city builders, procedural dungeon designers, and culture/faction mapping systems.

### 📚 Campaign Building
Structure your narrative with professional storytelling tools including story spine frameworks, dynamic timelines, and session planners.

### 🎭 DM Training Academy
Access techniques from RADA, Juilliard, and Carnegie Mellon adapted for Dungeon Masters—voice acting, improvisation, and performance mastery.

### 🧩 The Toy Method
Our revolutionary modular system gives you reusable building blocks (Toys) for NPCs, locations, encounters, and lore that combine for infinite variety.

### 🔗 World Anvil Integration
Seamless two-way sync with World Anvil. Import existing worlds, maintain canonical integrity, and enhance your workflow.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3.4 |
| Fonts | Space Grotesk, IBM Plex Sans, JetBrains Mono |
| Linting | ESLint + TypeScript ESLint |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ash-and-archive-studio.git
cd ash-and-archive-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── main.tsx                      # React entry point
├── App.tsx                       # App wrapper
├── styles/
│   └── globals.css               # Design tokens & utilities
├── pages/
│   └── LandingPage.tsx           # Main landing page
└── components/
    └── landing/
        ├── Hero.tsx              # Full viewport hero with particles
        ├── PainPoints.tsx        # DM struggle cards
        ├── Transformation.tsx    # Promise section
        ├── FourPillars.tsx       # Tabbed features
        ├── Testimonials.tsx      # Carousel + trust badges
        ├── TrainingPhilosophy.tsx # Editorial layout
        ├── WorldAnvilIntegration.tsx # Sync diagram
        ├── Pricing.tsx           # 3-tier pricing
        ├── FAQ.tsx               # Accordion FAQ
        ├── FinalCTA.tsx          # Email capture
        └── Footer.tsx            # Navigation footer
```

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `void-0` | `#070b10` | Deepest background |
| `void-1` | `#0d141d` | Card backgrounds |
| `void-2` | `#141d28` | Elevated surfaces |
| `arcane` | `#3dd2ff` | Primary accent (cyan) |
| `eldritch` | `#8b5cf6` | Secondary accent (purple) |
| `ember` | `#f4b545` | Warning/fire accent |
| `verdant` | `#39d98a` | Success accent |
| `forge-0` | `#f5f7fb` | Primary text |
| `forge-1` | `#c4ceda` | Secondary text |
| `forge-2` | `#8d98a7` | Muted text |

### Typography

- **Display/Headings:** Space Grotesk (600-700 weight)
- **Body/UI:** IBM Plex Sans (400-500 weight)
- **Data/Mono:** JetBrains Mono (400-500 weight)

### Motion

| Duration | Value | Usage |
|----------|-------|-------|
| Fast | 120ms | Hover/focus states |
| Base | 180ms | Buttons, toggles |
| Enter | 240ms | Panels, cards |
| Complex | 320ms | Page transitions |

**Easing:** `cubic-bezier(0.22, 1, 0.36, 1)`

---

## Accessibility

This project is built with WCAG 2.2 AA compliance:

- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Full keyboard navigation
- ✅ ARIA landmarks and labels
- ✅ `prefers-reduced-motion` support
- ✅ 44x44px minimum touch targets
- ✅ Semantic HTML structure
- ✅ Skip link for main content

---

## Roadmap

### Phase 1: Landing Page ✅
- [x] Complete 11-section landing page
- [x] Responsive design (360px–1440px+)
- [x] Animation system with reduced motion support
- [x] Accessibility audit

### Phase 2: Authentication & Dashboard
- [ ] User registration/login
- [ ] Dashboard layout
- [ ] Account settings

### Phase 3: World Building Engine
- [ ] City builder interface
- [ ] Dungeon designer
- [ ] Geography/climate tools
- [ ] Faction relationship mapping

### Phase 4: DM Training Academy
- [ ] Training module player
- [ ] Progress tracking
- [ ] Voice recording exercises
- [ ] Achievement system

### Phase 5: The Toy Method
- [ ] Toy creation interface
- [ ] Toy combination system
- [ ] Community toy sharing
- [ ] AI-assisted generation

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is proprietary software. All rights reserved.

---

<p align="center">
  <sub>Built with 🔥 for Dungeon Masters who refuse to be ordinary</sub>
</p>
