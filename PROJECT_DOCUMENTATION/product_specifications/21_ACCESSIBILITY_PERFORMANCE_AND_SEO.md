# 21. Accessibility, Performance & SEO

## 1. Accessibility (WCAG 2.1 AA Compliance)
- **High Contrast Ratios**: Text elements meet a minimum 4.5:1 contrast ratio against light and dark backgrounds.
- **Keyboard Navigation**: All interactive buttons, tabs, modal triggers, and form inputs are fully keyboard navigable with visible focus rings.
- **Screen Reader Support**: Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) with explicit `aria-label` and `role` attributes.

## 2. Performance & Production Optimization
- Vite Rollup code splitting with vendor chunking.
- Gzip compressed asset payloads (`index.css` ~10 KB, `index.js` ~182 KB).
- Zero render-blocking third-party scripts or ad trackers.\n