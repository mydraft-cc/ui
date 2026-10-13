# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

mydraft.cc is an open source wireframing tool: Vite + React 18, TypeScript, Redux Toolkit, Ant Design 5.

- `src/core/` contains framework-independent utilities (immutable collections, vectors, colors) and shared React helpers.
- `src/wireframes/model/` contains the editor state (`EditorState` → `Diagram` → `DiagramItem`) and the reducers in `actions/`.
- `src/wireframes/collaboration/` syncs the `editor` slice with Yjs via `yjs-redux` for real-time collaboration and undo/redo.
- `src/wireframes/engine/` contains the SVG and Pixi renderers, `src/wireframes/shapes/` contains the shape definitions.

## Commands

- `npm start` starts the dev server; `npm run start-local` uses `.env.local-server` (local `server2` for saving and collaboration).
- `npm run build` typechecks and builds.
- `CI=1 npx vitest run` runs all tests in jsdom; `npm test` runs them in the browser.
- `npm run lint` / `npm run lint:fix` runs eslint.

## Coding Guidelines

* Always run linting after code generation to fix formatting issues.
* Always use named constants for magic numbers.
* Do keep the number of tests small.
* Do not add unnecessary types, e.g. `void` for methods or return types that can easily be derived.
* Do not comment internal methods, instead ensure that we use good names.
* Do not fail silently in case of errors. Try to log something if it makes sense.
* Do not omit brackets, e.g. `afterAll(() => context.close());`
* Do not update generated code files manually like package-lock.json. Use the right tools for that, e.g. `npm i`
* Do not use lightgray for normal text as it is difficult to read.
* Do not use reduce on array, write it manually.
* If you write comments for types or members, write a single line only, keep it condensed and short.
* Move shared code in tests to `beforeEach` or `beforeAll`
* Only write comments to explain the why, not what the code does.
* Only comment behavior, and never use block comments (`/* ... */`) for it. Use single-line `//` comments instead. The license header at the top of each file is the only exception.

```
// DONT
/*
 * The diff algorithm compares by reference, therefore the same source value must always return the same converted value.
 */

// DO
// Returns the same converted value for the same source value, so that unchanged properties produce no updates.
```

* Use spread operators and simplifications for mappings.
* Use strict types for typescript code.
* Use the following syntax for tests: `it('should do y when y')`
* Use vitest for all tests.
* Write documentation in a very easy and practical style, so that it is easy to follow. It should be very hands-on.

* When mapping code, destructure the source instead of repeating it:

```
// DONT
.map((metric) => ({
    key: metric.key,
    label: metric.label,
    unit: metric.unit ? metric.unit.toUpperCase() : null,
}))

// DO
.map(({ key, label, unit }) => ({
    key,
    label,
    unit: unit ? unit.toUpperCase() : null,
}))
```
