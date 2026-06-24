import React from 'react';
import { BannerHero } from '../components/BannerHero';
import { ProductGrid2x2 } from '../components/ProductGrid2x2';
import { DynamicCollection } from '../components/DynamicCollection';
import { FullScreenOverlay } from '../components/FullScreenOverlay';

/**
 * Component Registry (Factory Pattern).
 *
 * Each SDUI `type` maps to a React component. Adding a new component:
 *   1. Build the component.
 *   2. Add it to the registry here.
 * The renderer never needs a switch statement — making it scalable to
 * hundreds of component types.
 *
 * Unknown types resolve to `undefined`, and the renderer falls back to
 * `null` (graceful failure).
 */

// Use `React.ComponentType<any>` so each registry entry can accept its own
// strongly-typed props at the call site, while the registry itself stays
// homogeneous.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RegistryEntry = React.ComponentType<any>;

export const componentRegistry: Record<string, RegistryEntry> = {
  BANNER_HERO: BannerHero,
  PRODUCT_GRID_2X2: ProductGrid2x2,
  DYNAMIC_COLLECTION: DynamicCollection,
  FULL_SCREEN_OVERLAY: FullScreenOverlay,
};

export function resolveComponent(type: string): RegistryEntry | undefined {
  return componentRegistry[type];
}
