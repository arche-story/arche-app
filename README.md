<div align="center">
  <img src="public/logo/arche.png" alt="Arche Logo" width="400" />
  
  <h1>Arche — The Origin of Every Idea</h1>
  
  <p>
    Create, version, and register your AI-born ideas on-chain.
  </p>
</div>

---

## About

**Arche** is a creative platform that allows artists and creators to generate AI art, preserve every version of their creative journey, and register their final pieces on-chain via Story Protocol. Inspired by Van Gogh's midnight blues and auric strokes, Arche remembers not just the art, but the journey that birthed it.

> "We remember not only the art, but the journey that birthed it." — Arche

## Features

### 🎨 **Studio**
- AI-powered art generation from text prompts
- Real-time preview of generated pieces
- Save and version control for every iteration

### 📜 **Timeline**
- Track your complete creative journey
- View all saved versions and drafts
- See which pieces have been registered on-chain

### 🖼️ **Gallery**
- Browse all your registered pieces
- On-chain verification via Story Protocol
- Permanent record of your authorship

### 🎭 **Creative Sequence**
1. **Paint** — Describe your scene, mood, and emotion. Let AI render it in seconds.
2. **Save** — Each variation is kept as a version in your timeline. No idea is ever lost.
3. **Sign** — Register the final piece on Story Protocol and make your authorship verifiable.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations:** [GSAP](https://gsap.com/) with ScrollTrigger
- **Smooth Scrolling:** [Lenis](https://lenis.studiofreight.com/)
- **WebGL:** [OGL](https://github.com/oframe/ogl)
- **Routing Transitions:** [next-transition-router](https://github.com/steven-tey/next-transition-router)

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd arche-fe
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run check` — Type check with TypeScript
- `npm run compress-images` — Compress images in public folder

## Project Structure

```
arche-fe/
├── app/
│   ├── (landing-page)/     # Landing page with hero and sections
│   ├── studio/              # AI art generation studio
│   ├── gallery/             # Gallery of registered pieces
│   ├── timeline/            # Creative journey timeline
│   └── layout.tsx           # Root layout
├── components/              # Reusable UI components
│   ├── core/               # Core components (CircularGallery, TextPressure)
│   └── wrapper/            # Client-side wrappers
├── lib/                     # Utilities and helpers
│   ├── animations/         # GSAP animations and route transitions
│   └── utils.ts            # General utilities
├── public/                  # Static assets
│   ├── images/             # Image assets
│   └── logo/               # Logo files
└── scripts/                 # Build and utility scripts
```

## Development Status

This project is currently in active development. Some features are still being implemented:

- [ ] AI generation API integration
- [ ] Local storage/API persistence for saved versions
- [ ] Story Protocol SDK integration for on-chain registration
- [ ] User authentication
- [ ] Enhanced gallery features

## Design Philosophy

Arche's design is inspired by Van Gogh's artistic style:
- **Midnight Blues** — Deep, rich blue gradients representing the creative night
- **Auric Strokes** — Golden yellow accents symbolizing inspiration and creativity
- **Journey Preservation** — Every draft and iteration is valued, not just the final piece

## License

Private project.

## Acknowledgments

- Inspired by Vincent van Gogh's artistic vision
- Built with [Story Protocol](https://www.story.foundation/) for on-chain IP registration
