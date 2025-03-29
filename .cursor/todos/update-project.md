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
- **React Upgrade Completed:**
  - Successfully upgraded React from v17 to v18.2.0.
  - Updated React DOM to v18.2.0.
  - Updated related types (@types/react, @types/react-dom).
  - Replaced ReactDOM.render with createRoot API.
  - Key React dependencies like react-redux (v8.1.3) and react-dnd (v16.0.1) were already compatible with React 18.
  - Deferred the React Router upgrade from v5 to v6 for a separate phase due to significant API changes.
- **Vite & TypeScript Upgrade Completed:**
  - Successfully upgraded Vite from v5.0.0 to v6.2.3.
  - Updated @vitejs/plugin-react to v4.3.4.
  - Updated TypeScript from v5.3.2 to v5.8.2.
  - No changes to tsconfig.json were required; the existing configuration worked with the new versions.
  - Build process works correctly with the new versions.
  - Development server (hot module replacement) functions properly.
  - Several peer dependency warnings appeared during installation, primarily related to Storybook components and PWA plugins expecting Vite 5.x, but these didn't affect functionality.
- **Ant Design Upgrade Completed:**
  - Successfully upgraded Ant Design from v5.11.2 to v5.24.5.
  - Updated @ant-design/icons to v5.2.6.
  - Fixed TypeScript compatibility issues with Ant Design icons by creating utility functions.
  - Fixed outdated import paths for MenuItemType in Components.tsx.
  - Improved build compatibility with TypeScript's stricter type checking.

## Active
- [ ] **Upgrade Redux Toolkit & Related:**
  - [ ] Update `@reduxjs/toolkit`, `react-redux`, `redux`, `redux-thunk`.
  - [ ] Check for deprecations or changes in API usage.
  - [ ] Verify that Redux DevTools integration still works.
  - [ ] Test store functionality.

## Pending
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
- [x] **Upgrade React:**
   - [x] Update `react` and `react-dom` packages.
   - [x] Update related types (`@types/react`, `@types/react-dom`).
   - [x] Address breaking changes (e.g., `ReactDOM.render` to `createRoot`).
   - [x] Update related dependencies if necessary (e.g., React Router, Redux bindings). (Deferring major updates like RRv6)
   - [x] Update `react-dnd` and `react-dnd-html5-backend` (Already done to v16.0.1)
   - [x] Update `react-redux` (Already done to v8.1.3)
- [x] **Upgrade Vite & TypeScript:**
  - [x] Update `vite` from v5.0.0 to latest stable (v6.2.3).
  - [x] Update `@vitejs/plugin-react` to latest compatible version (v4.3.4).
  - [x] Update `typescript` from current v5.3.2 to latest stable (v5.8.2).
  - [x] Update `tsconfig.json` if needed based on new TypeScript/Vite versions. (No changes required)
  - [x] Validate build with updated configuration. (Successful)
  - [x] Run dev server to ensure hot reloading functionality works. (Successful)
- [x] **Upgrade Ant Design:**
  - [x] Update `antd` to latest version within v5.x (v5.24.5).
  - [x] Update `@ant-design/icons` to compatible version (v5.2.6).
  - [x] Fix TypeScript compatibility issues with icon components.
  - [x] Update outdated import paths.
  - [x] Test UI components in the application.