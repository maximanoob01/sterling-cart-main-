# TrackOrder — Refactored

Drop-in replacement for the original `TrackOrderPage.jsx` with a
modular structure, modern UX, and a fully responsive stepper.

## Folder layout

```
TrackOrder/
├── index.jsx                    # Public re-export
├── TrackOrderPage.jsx           # Thin orchestrator (~100 LoC)
├── components/
│   ├── BackgroundDecor.jsx      # Dot grid + glow orbs + fade
│   ├── Header.jsx               # Sticky breadcrumb + page hero
│   ├── TrackingForm.jsx         # Order ID + contact lookup form
│   ├── ErrorState.jsx           # "Not found" card with retry / support
│   ├── OrderDetailsCard.jsx     # Invoice CTA + 5-up meta grid
│   ├── OrderStepper.jsx         # Horizontal (md+) / vertical (<md) timeline
│   ├── OrderItemsList.jsx       # Items table → cards on mobile
│   └── OrderSummary.jsx         # Charges + totals
├── hooks/
│   └── useOrderTracking.js      # All order-lookup state + side-effects
├── constants.js                 # STATUS_META (icon + gradient + label)
├── motion.js                    # Shared Framer Motion variants
├── theme.js                     # Shared className "primitives"
└── format.js                    # Date / time helpers
```

## What changed (and why)

| # | Change | Rationale |
|---|--------|-----------|
| 1 | Split into 11 files | Single file was ~300 LoC, hard to scan & test. |
| 2 | `useOrderTracking` hook | Side-effects isolated from view. Trivially mockable. |
| 3 | `STATUS_META` table | One source of truth for icons, labels and gradients. |
| 4 | Shared variants in `motion.js` | Global timing / easing is a one-line change. |
| 5 | Shared classNames in `theme.js` | One place to tune the "glass card" look. |
| 6 | **Vertical stepper on mobile** | Original was broken on phones (overflow + cramped). |
| 7 | Animated "current step" ping | Pinpoints exactly where the order is right now. |
| 8 | "Copy order ID" button | Quality-of-life win for support workflows. |
| 9 | "Track another order" CTA | Was impossible to retry without a page reload. |
| 10 | "Try again" + "Contact support" in errors | Never let the user feel stuck. |
| 11 | Semantic HTML (`<nav>`, `<ol>`, `<dl>`, `<section>`) | Better screen-reader experience. |
| 12 | Focus-visible rings on every interactive element | Keyboard nav that actually looks intentional. |
| 13 | `aria-current="step"` on the active timeline step | Screen readers announce progress. |
| 14 | Uncontrolled form inputs via `FormData` | Resets are now free. |

## Migration

1. Replace `src/pages/TrackOrderPage.jsx` with the contents of this folder.
2. Make sure these dependencies are available (they were already used in
   the original):
   ```json
   {
     "react": "^18",
     "react-router-dom": "^6",
     "framer-motion": "^11",
     "lucide-react": "^0.300"
   }
   ```
3. Update the route import if needed:
   ```jsx
   import TrackOrderPage from './pages/TrackOrder';
   ```

## Tailwind config

The original used a few custom colour names. Make sure your
`tailwind.config.js` still defines them:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        charcoal: '#1a1a1a',
        silver:   {
          50:  '#fafafa',
          100: '#f1f1f1',
          300: '#c8c8c8',
          400: '#9a9a9a',
          500: '#6f6f6f',
        },
      },
    },
  },
};
```

## Responsive behaviour

| Breakpoint | Layout |
|------------|--------|
| `< 768px`  | Single-column. Stepper becomes vertical. Items become cards. |
| `≥ 768px`  | Multi-column details. Horizontal stepper. Sticky table layout for items. |
| `≥ 1024px` | Wider gutters, more breathing room around hero text. |

## Future ideas (not implemented)

- Real-time polling (e.g. every 30s) for in-flight orders
- Skeleton loaders for first paint
- A "Reorder" button at the end of the items list
- Estimated delivery window in the stepper header
- "Cancel order" CTA for pre-shipment statuses
