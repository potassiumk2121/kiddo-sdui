# SDUI Shop — Server-Driven UI React Native App

A React Native (Expo, TypeScript Strict) e-commerce homepage rendered entirely
from JSON, demonstrating a production-grade Server-Driven UI architecture with
performance optimizations, live campaign switching, OTA theming, and an
optimized cart.

---

## ✨ Features at a glance

| Feature | Status |
|---|---|
| TypeScript Strict Mode | ✅ |
| Homepage rendered from local JSON | ✅ |
| Component Registry / Factory Pattern | ✅ |
| FlashList (single feed) | ✅ |
| Dynamic theming via React Context | ✅ |
| Cart state (Zustand, selective subscriptions) | ✅ |
| Live campaign switching (no code change) | ✅ |
| 3 campaigns (Back To School, Summer Playhouse, Mystery Gift Carnival) | ✅ |
| Full-Screen Overlay with `pointerEvents="none"` | ✅ |
| Universal Action Dispatcher | ✅ |
| Dynamic Collection (horizontal in vertical feed) | ✅ |
| Graceful fallback for unknown component types | ✅ |

---

## 🚀 Running the project

> Requires **Node ≥ 18** and the **Expo CLI** (bundled with `npx expo`).

```bash
# 1. Install dependencies
npm install

# 2. Start Metro bundler
npx expo start

# 3. Open the app
#   • Scan the QR code with the Expo Go app (iOS / Android)
#   • OR press "i" / "a" in the terminal to launch the iOS / Android simulator
#   • OR press "w" to launch in the browser
```

If you prefer Yarn:

```bash
yarn install
yarn start
```

Useful scripts:

```bash
npm run typecheck   # TypeScript strict-mode validation
npm run android     # Launch Android emulator
npm run ios         # Launch iOS simulator
npm run web         # Run in browser
```

---

## 🏗️ Project structure

```
sdui-app/
├── App.tsx                        # Wires ThemeProvider to campaign theme
├── src/
│   ├── types/sdui.ts              # SDUI payload + action type definitions
│   ├── theme/ThemeContext.tsx     # OTA theming via React Context
│   ├── store/
│   │   ├── cartStore.ts           # Zustand cart + selective hooks
│   │   └── campaignStore.ts       # Active campaign payload + switcher
│   ├── registry/
│   │   └── componentRegistry.ts   # type → React component map
│   ├── actions/
│   │   └── actionDispatcher.ts    # Universal handleAction()
│   ├── components/
│   │   ├── BannerHero.tsx
│   │   ├── ProductGrid2x2.tsx
│   │   ├── DynamicCollection.tsx  # Horizontal FlatList in vertical feed
│   │   ├── FullScreenOverlay.tsx  # pointerEvents="none"
│   │   ├── ProductCard.tsx        # Memoized, per-product subscription
│   │   ├── CartCounter.tsx
│   │   ├── CampaignSwitcher.tsx
│   │   └── SectionRenderer.tsx    # Looks up registry, fails gracefully
│   ├── screens/HomeScreen.tsx     # Single FlashList feed
│   └── data/
│       ├── products.ts
│       ├── productResolver.ts
│       └── campaigns/             # 3 JSON payloads
│           ├── backToSchool.json
│           ├── summerPlayhouse.json
│           └── mysteryGiftCarnival.json
```

---

## 🧩 Architecture & decisions

### 1. SDUI payload contract

Every screen is described by a `CampaignPayload`:

```ts
{
  campaignId: string;
  campaignName: string;
  theme: ThemeConfig;       // primary, background, text, ...
  components: SDUINode[];   // ordered list of UI nodes
}
```

Each `SDUINode` has `{ id, type, props }`. The `type` is the registry key.

### 2. Component Registry (Factory Pattern)

`src/registry/componentRegistry.ts` is a flat map:

```ts
export const componentRegistry = {
  BANNER_HERO: BannerHero,
  PRODUCT_GRID_2X2: ProductGrid2x2,
  DYNAMIC_COLLECTION: DynamicCollection,
  FULL_SCREEN_OVERLAY: FullScreenOverlay,
};
```

`SectionRenderer` looks up `node.type` here and renders the matched
component — no `switch` statements anywhere. Adding a new SDUI type is a
**one-line** registry change plus the new component file.

**Unknown types** resolve to `undefined` → `SectionRenderer` returns `null`
in production (and a small dashed-border warning in dev). The
`summerPlayhouse.json` payload intentionally includes an
`EXPERIMENTAL_WIDGET` node to demonstrate this graceful fallback.

### 3. Universal Action Dispatcher

Components contain **zero business logic**. Every interaction calls
`handleAction(action)` from `src/actions/actionDispatcher.ts`:

```ts
handleAction({ type: 'ADD_TO_CART', payload: { productId: 'lb-1' } });
```

Supported actions: `ADD_TO_CART`, `REMOVE_FROM_CART`, `DEEP_LINK`,
`OPEN_PRODUCT`, `APPLY_COUPON`, `SWITCH_CAMPAIGN`, `DISMISS_OVERLAY`, `NOOP`.

Adding a new action: extend the `ActionType` union and add a handler to the
dispatcher. No component changes required.

### 4. Single feed (FlashList)

The homepage is **one** `FlashList`. `SectionRenderer` is memoized on node
identity so:

- Switching campaigns swaps the whole `data` array — FlashList recycles rows.
- Adding to cart does **not** invalidate any node identity → the feed does
  **not** re-render. Only the touched `ProductCard` and `CartCounter` update.

`overrideItemLayout` provides per-type size hints to optimize the recycler
pool.

### 5. Dynamic Collection (horizontal in vertical)

Implemented with a horizontal `FlatList` inside a `FlashList` row:

- `getItemLayout` skips measurement (constant-time scroll-to-index).
- `removeClippedSubviews`, `initialNumToRender`, `windowSize`,
  `maxToRenderPerBatch` tuned for smooth horizontal scrolling.
- Renders the same memoized `ProductCard` → no duplicate code paths.

### 6. OTA Runtime Theming

`ThemeProvider` accepts a `ThemeConfig` and exposes it via `useTheme()`.
`App.tsx` reads the theme from `useActiveTheme()` (campaign store) and
pushes it into the provider. Changing campaign JSON ⇒ new theme object ⇒
all `useTheme()` consumers re-render instantly.

### 7. Optimized cart (Zustand + selective subscriptions)

Why **Zustand** instead of Redux or Context:

- **Selective subscriptions**: `useProductQuantity(id)` returns a primitive
  scoped to one product. Updating product A's quantity does **not**
  re-render product B's card.
- **Zero boilerplate**, no provider, works inside FlashList rows.
- The aggregate `useCartCount()` hook is the only thing the cart badge
  subscribes to — keeping the header light.

Combined with `React.memo` on `ProductCard`, this satisfies the
"entire homepage must NOT re-render on add-to-cart" requirement.

### 8. Campaigns

Three campaigns live in `src/data/campaigns/*.json`:

| Campaign | Theme | Animation |
|---|---|---|
| Back To School | Yellow + Blue | Sparkle |
| Summer Playhouse | Ocean blue + teal | Water splash ripples |
| Mystery Gift Carnival | Carnival red on deep purple, gold accent | Confetti |

Switching is just a `SWITCH_CAMPAIGN` action — the user can switch via the
pill bar at the top of the screen, **without changing any app code**.

### 9. Full Screen Overlay

`FullScreenOverlay` is rendered as a sibling of the feed (absolutely
positioned, `StyleSheet.absoluteFill`) with **`pointerEvents="none"`** so
the user can keep scrolling, tapping, and adding to cart while the
animation plays. The overlay auto-dismisses after `durationMs` and supports
four animation types: `confetti`, `water-splash`, `sparkle`, `lottie`
(placeholder for when a Lottie native module is linked).

---

## 🧪 Testing the architecture

1. **Open the app** → Back To School campaign loads (yellow + blue, sparkles).
2. **Tap the pill "Summer Playhouse"** → theme instantly flips to ocean blue,
   water-splash overlay starts. *No app reload, just a JSON swap.*
3. **Tap "Mystery Gift Carnival"** → dark purple + red theme, confetti rains,
   the banner CTA dispatches `APPLY_COUPON` with code `MYSTERY50`.
4. **Add items to cart** in any campaign → the cart badge updates, but the
   feed does not flicker. Open React DevTools Profiler to confirm only the
   touched `ProductCard` and `CartCounter` re-render.
5. **Notice the dashed-border warning** in the Summer Playhouse campaign
   (`EXPERIMENTAL_WIDGET`) — demonstrating graceful fallback for unknown
   component types.

---

## 📦 Mock JSON payloads

The campaign JSONs satisfy the assignment contract:

```json
{
  "theme": { "primary": "#FFC72C", "background": "#FFF8DC", ... },
  "components": [
    { "id": "hero-1",    "type": "BANNER_HERO",        "props": { ... } },
    { "id": "grid-1",    "type": "PRODUCT_GRID_2X2",   "props": { ... } },
    { "id": "coll-1",    "type": "DYNAMIC_COLLECTION", "props": { ... } },
    { "id": "overlay-1", "type": "FULL_SCREEN_OVERLAY","props": { ... } }
  ]
}
```

Product catalogs are referenced by a `productSource` string and resolved
client-side (`productResolver.ts`) so JSON stays small. In production the
backend would inline product IDs or full objects.

---

## 🔬 Type safety

`tsconfig.json` runs in **strict mode**:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true
}
```

Run `npm run typecheck` to verify.

---

## 🛣️ Extending the app

| To add… | …do this |
|---|---|
| A new SDUI component | Create the component, add it to `componentRegistry`, reference its `type` in any campaign JSON. |
| A new action | Add the literal to `ActionType` and a handler in `actionDispatcher.ts`. |
| A new campaign | Add a JSON file under `src/data/campaigns/` and register it in `campaignStore.ts`. |
| A new theme token | Extend `ThemeConfig` and the default theme. |

---

## 📝 License

MIT — for assignment/demo purposes.
