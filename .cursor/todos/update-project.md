# Project Update/Upgrade Todo List

## Description
This file tracks the tasks involved in updating and upgrading the `mydraft.cc` frontend project. The primary goals are:
- Upgrade React from v17 to the latest stable version (e.g., v18 or v19 if stable and compatible).
- Update other key dependencies (e.g., Ant Design, Redux Toolkit, Vite, TypeScript) to recent versions.
- Perform general cleanup and address any technical debt identified during the upgrade process.
- Ensure the application remains stable and functional after upgrades.

- ALWAYS USE CHECKBOXES for tasks.
- Track progress by moving tasks from Pending -> Active -> Completed.
- Update the Memory section with significant findings, decisions, or challenges encountered.
- This effort aims to modernize the stack, improve performance/security, enhance developer experience, and ensure long-term maintainability.

## Memory Section Guidelines
- ALWAYS maintain the Memory section in each todo file
- UPDATE the Memory section when:
  - Making significant implementation decisions (e.g., choosing React 18 vs 19, deciding on major package version jumps)
  - Overcoming technical challenges (e.g., breaking changes in dependencies, compatibility issues)
  - Discovering future considerations (e.g., further refactoring opportunities)
  - Gaining new technical insights (e.g., new best practices for React/Redux)
  - Adding or modifying dependencies (e.g., needing new polyfills or adapters)
- ENSURE the Memory section provides clear context for the upgrade process.
- USE the Memory section to document rationale, track evolution, record lessons learned, and note potential improvements.

## Memory
*(Add notes here as the upgrade progresses)*
- Initial assessment: Project uses React 17, Redux Toolkit, Ant Design 5, Vite 5. Need to check compatibility between target versions.
- **Dependency Analysis Findings:**
  - **Target:** Upgrade to latest stable versions (React 18, RRv6, RTK 2.x, Vite 5.x, Storybook 8.x, Vitest 1.x, etc.).
  - **Major Efforts:** React (17->18: `createRoot` API), React Router (5->6: major API changes), Drag & Drop (`react-beautiful-dnd` unmaintained, consider alternatives like `@hello-pangea/dnd`).
  - **Other Updates:** Ant Design (within v5 likely smooth), Redux Toolkit (check 1.x->2.x changes), Vite (minor updates), TypeScript (minor updates), Storybook (use upgrade script), Testing libs (check compatibility), ESLint/Stylelint (check new rules).
  - **Strategy:** Upgrade libraries incrementally, starting with React.

## Active
- [ ] **Upgrade React:**
   - [x] Update `react` and `react-dom` packages.
   - [x] Update related types (`@types/react`, `@types/react-dom`).
   - [x] Address breaking changes (e.g., `ReactDOM.render` to `createRoot`).
   - [ ] Update related dependencies if necessary (e.g., React Router, Redux bindings). (Deferring major updates like RRv6)

## Pending
- [ ] **Upgrade Vite & TypeScript:**
  - [ ] Update `vite`, `@vitejs/plugin-react`.
  - [ ] Update `typescript`.
  - [ ] Update `tsconfig.json` if needed based on new TypeScript/Vite versions.
- [ ] **Upgrade Ant Design:**
  - [ ] Update `antd`.
  - [ ] Review Ant Design migration guides and update component usage if necessary.
- [ ] **Upgrade Redux Toolkit & Related:**
  - [ ] Update `@reduxjs/toolkit`, `react-redux`, `redux`, `redux-thunk`.
  - [ ] Check for deprecations or changes in API usage.
- [ ] **Upgrade Routing (React Router):**
  - [ ] Update `react-router`, `react-router-dom`.
  - [ ] Check for breaking changes or new patterns.
- [ ] **Upgrade Testing Libraries:**
  - [ ] Update `vitest`, `@vitest/browser`, `@vitest/coverage-*`, `playwright`.
  - [ ] Update test setup and assertions if necessary.
- [ ] **Upgrade Other Dependencies:** Update remaining dependencies identified in the analysis phase.
- [ ] **Linting/Formatting Updates:**
  - [ ] Update ESLint, Stylelint, and related plugins/configs.
  - [ ] Run `npm run lint:fix` and address any new issues.
- [ ] **Thorough Testing:**
  - [ ] Run all unit/integration tests (`npm run test:ci`).
  - [ ] Perform manual end-to-end testing of core features (drawing, saving, UI interactions).
  - [ ] Run Storybook and check component rendering (`npm run storybook`).
  - [ ] Run Chromatic visual tests (`npm run chromatic`) if configured and relevant.
- [ ] **Code Cleanup:** Address any warnings, TODOs, or minor refactoring opportunities identified.
- [ ] **Documentation Update:** Update `README.md` or other relevant docs if build/run commands or dependencies change significantly.
- [ ] **Update Context:** Update `.cursor/context.md` with new versions and any architectural changes.

## Completed
*(Move completed tasks here)*
- [x] **Dependency Analysis:** Thoroughly review `package.json`. Identify outdated packages, check changelogs for breaking changes between current and target versions. Pay special attention to React, ReactDOM, Redux Toolkit, React Router, Ant Design, Vite, and testing libraries.
- [x] **Create Upgrade Branch:** Create a dedicated Git branch for the upgrade process (e.g., `feat/project-upgrade`). (Marked as done based on user confirmation)