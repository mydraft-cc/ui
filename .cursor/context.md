# Project Context: mydraft Server

## Overview
`mydraft.cc` is an open-source wireframing tool designed as a free alternative to commercial options. It allows users to create diagrams and wireframes. The project is developed using React and TypeScript. You can test it live at https://mydraft.cc/.

## Architecture
- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite 6
- **State Management:** Redux Toolkit 2
- **Routing:** React Router v6
- **UI Library:** Ant Design v5
- **Core Diagramming:** Pixi.js, SVG.js, d3 for rendering and interaction.
- **Styling:** Sass/SCSS (indicated by `index.scss` and `sass` dev dependency)
- **Component Development:** Storybook 8
- **Testing:** Vitest (unit/integration), Playwright (end-to-end browser testing), React Testing Library (likely, via Vitest integration)

The application follows a component-based architecture, likely separating concerns into core logic, UI components, state management, and specific feature modules (e.g., `wireframes`).

## Technology Stack
- **Core:** React 18, TypeScript 5.8, Vite 6, Redux Toolkit 2, React Router 6
- **UI:** Ant Design 5.24, React Beautiful DnD, React Color
- **Graphics:** Pixi.js, SVG.js, d3-selection, d3-zoom
- **Utilities:** classnames, date-fns, deep-object-diff, marked (for markdown), mousetrap (for keyboard shortcuts)
- **Development:** Node.js, npm
- **Linting/Formatting:** ESLint (based on Airbnb TypeScript config with modifications), Stylelint
- **Testing:** Vitest, Playwright, @vitest/coverage-v8 (for coverage)
- **Component Documentation:** Storybook 8, Chromatic (for visual testing)
- **CI/CD:** GitHub Actions (implied by `.github/`), Codecov
- **Containerization:** Docker (Dockerfile.build exists)
- **PWA:** Configured via `vite-plugin-pwa`

## Implementation Status
- According to `README.md`, milestones up to v1.0.3 (linking UI elements) are completed.
- The project seems relatively mature and functional.
- Uses modern tooling like Vite and Redux Toolkit.

## Package Relationships
- `@app/*` alias points to `src/*`.
- `package.json` defines dependencies and devDependencies.
- `store.ts` likely integrates various Redux slices/reducers from different parts of the application.
- `App.tsx` serves as the root component, integrating routing and major layout components.
- `wireframes/` directory contains the core logic for the wireframing canvas and shapes.

## Development Workflow
- **Install:** `npm i`
- **Run Dev Server:** `npm start` (connects to backend defined by `VITE_SERVER_URL` in `.env` or default Vite settings, likely `http://localhost:5173` or `http://localhost:3002` as per README)
- **Run Dev Server (Local Backend):** `npm run start-local` (uses `VITE_SERVER_URL` from `.env.local-server`, i.e., `http://localhost:8080`)
- **Build:** `npm run build` (outputs to `dist/` folder)
- **Lint:** `npm run lint` / `npm run lint:fix`
- **Test:** `npm test` (runs Vitest in browser mode), `npm run test:ci` (runs Vitest headlessly with coverage)
- **Storybook:** `npm run storybook` / `npm run build-storybook`
- **Contribution:** Guidelines in `README.md`, specific guide for shapes in `src/wireframes/shapes/README.md`.

## Environment Variables
- `VITE_SERVER_URL`: Defines the base URL for the backend API.
  - `.env`: `http://localhost:8001/api` (Purpose unclear - potentially staging or production-like local setup?)
  - `.env.local-server`: `http://localhost:8080` (Used for `start-local` script, likely points to a locally running backend server)
