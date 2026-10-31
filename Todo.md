# Todo – mydraft UI

## Before merging `feature/collaboration`

- [ ] Publish `yjs-redux` 0.16.0 to npm (branch `redux5` in the clone), then remove `vendor/` and the `COPY vendor` line in the `Dockerfile`.
- [ ] Deploy the `server2` collaboration endpoint and set `VITE_SERVER_COLLABORATION_URL` for production builds.
- [ ] Add expiry/cleanup for rooms stored in Google Cloud Storage.
- [ ] Accept the new Chromatic baselines for the raster stories (Pixi now renders images).
- [ ] Make the raster stories deterministic: local test image instead of `picsum.photos`.
- [x] Fix `npm run lint`: rename `.eslintrc.js` to `.eslintrc.cjs`. (3 older errors remain in `ColorPicker.tsx` and `TextAdorner.tsx`.)

## Big-ticket items

1. ~~**Finish collaboration**~~ – done: live cursors, unreachable-server state, safe joining of empty rooms, named versions (stored in the room's Yjs document). Follow-up: block editing while waiting for an empty room's content.
2. **Export pipeline** – PNG/SVG/PDF per page or selection, plus a clickable HTML prototype built from page links.
3. **Connectors & user flows** – arrows that stay attached to shapes and pages, with auto-routing and labels.
4. **Reusable components (symbols)** – define once, place instances, override text and props per instance, propagate edits.
5. **Auto-layout & responsive frames** – stack containers (direction, gap, padding) and resize constraints.
6. **AI generation** – wireframe from a prompt or screenshot, and "edit selection by prompt".
7. **Code export** – HTML/Tailwind or React from a page.
8. **Shape libraries & theming** – iOS/Material/Bootstrap kits, a hand-drawn style, and a plugin format for community libraries.
9. **Review workflow** – view-only links, comments pinned to shapes, reviewer mode in the presentation view.
10. **Single rendering engine** – settle on SVG or Pixi (or a shared scene graph); the raster bug showed how easily the two drift apart.
