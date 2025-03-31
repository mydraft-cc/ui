# Dark Mode Implementation: Critical Fixes

## Issues Analysis
There are several critical issues with how theme changes are being managed and propagated throughout the application, particularly affecting canvas items and toolbar shapes:

1. **Multiple theme state sources** - Discord between React/Redux state and ThemeShapeUtils
2. **Inconsistent theme detection methods** - Different components use different approaches
3. **Theme change timing problems** - Race conditions in theme application
4. **Canvas-specific rendering issues** - Special handling needed for non-React components
5. **Inconsistent shape theming** - Not all shapes properly implement theme awareness
6. **Toolbar shapes not updating** - Shapes in the toolbar don't immediately reflect theme changes

## Todo Items

### 1. Theme State Management ✅
- [x] **Establish single source of truth**
  - [x] Add direct synchronization in ThemeProvider:
    ```typescript
    // In ThemeProvider useEffect:
    updateCurrentTheme(effectiveTheme);
    ```
  - [x] Ensure ThemeShapeUtils exposes proper update method:
    ```typescript
    // Add/update in ThemeShapeUtils:
    export const updateCurrentTheme = (theme: Theme) => {
      const previousTheme = currentTheme;
      currentTheme = theme;
      
      // If theme changed, notify listeners
      if (previousTheme !== theme) {
        themeChangeListeners.forEach(listener => listener(theme));
        return true;
      }
      return false;
    };
    ```

### 2. Consistent Theme Detection ✅
- [x] **Audit theme detection across components**
  - [x] React components: Verify using `useAppSelector(selectEffectiveTheme)`
  - [x] PIXI/Canvas components: Verify using `getCurrentTheme()` from ThemeShapeUtils
  - [x] Update components with inconsistent approaches

### 3. Theme Propagation Timing ✅
- [x] **Improve theme change handling**
  - [x] Increase timeout in ThemeProvider:
    ```typescript
    // Increase from 50ms to 150-200ms
    const timeoutId = setTimeout(() => {
      forceTriggerThemeChange();
    }, 200);
    ```
  - [x] Add debug logging in theme changes
  - [x] Add theme change listener cleanup

### 4. Canvas Rendering ✅
- [x] **Fix Editor component theme handling** 
  - [x] Review `Editor.tsx` to ensure it properly updates background on theme changes
  - [x] Add explicit theme change handlers to all canvas layers
  - [x] Update background and grid colors based on theme
  - [x] Implement theme-aware border colors

### 5. Shape Implementations ✅
- [x] **Update shape components**
  - [x] Improve `ItemsLayer.tsx` to handle theme changes properly
  - [x] Add `forceRerender` method to force component redraws
  - [x] Create consistent pattern for theme-aware colors

### 6. ThemeShapeUtils Enhancements ✅
- [x] **Improve theme utility functionality**
  - [x] Add debug logging
  - [x] Add forced repaint method for shapes
  - [x] Ensure proper notification system for theme changes

### 7. Theme Constants Organization ✅
- [x] **Centralize theme color definitions**
  - [x] Update CommonTheme in `_theme.ts` to use dynamic theme-aware values
  - [x] Define fallback colors for both themes
  - [x] Update getThemeColors to support direct theme specification

### 8. Toolbar Shape Rendering Issues
- [ ] **Fix toolbar shape theme handling**
  - [ ] Find toolbar component where shapes are rendered
  - [ ] Add direct theme change listeners to toolbar component
  - [ ] Force re-render of toolbar shapes on theme changes
  - [ ] Ensure proper cleanup of listeners
  - [ ] Implement debouncing to prevent multiple re-renders

### 9. Testing & Verification
- [ ] **Create test plan**
  - [ ] Test theme toggle behavior
  - [ ] Test system theme change behavior
  - [ ] Test individual shape rendering in both themes
  - [ ] Verify toolbar shapes update correctly
  - [ ] Verify canvas shapes update correctly

### 10. Performance Considerations
- [ ] **Optimize theme change performance**
  - [ ] Profile rendering during theme changes
  - [ ] Add selective refresh instead of full redraw
  - [ ] Consider using `React.memo` with custom comparisons

## Implementation Approach
1. ✅ Establish the single source of truth for theme state
2. ✅ Fix theme propagation timing issues 
3. ✅ Update canvas rendering
4. ⚠️ Fix toolbar shape rendering
5. ⬜ Test thoroughly in both themes
6. ⬜ Optimize performance

## References
- `src/wireframes/components/ThemeProvider.tsx` - Theme state management
- `src/wireframes/shapes/neutral/ThemeShapeUtils.ts` - Theme utility functions
- `src/wireframes/renderer/Editor.tsx` - Canvas rendering
- `src/style/_theme.scss` - CSS variables for theming 