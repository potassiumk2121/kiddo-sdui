/**
 * Core SDUI (Server-Driven UI) type definitions.
 *
 * Every screen / campaign delivered by the backend (or local JSON) must
 * conform to `SDUIPayload`. The renderer is intentionally dumb: it looks up
 * `type` in the component registry and feeds `props` to the matched component.
 */

// ---------- Theme ----------
export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
}

// ---------- Actions ----------
export type ActionType =
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'DEEP_LINK'
  | 'OPEN_PRODUCT'
  | 'APPLY_COUPON'
  | 'SWITCH_CAMPAIGN'
  | 'DISMISS_OVERLAY'
  | 'NOOP';

export interface SDUIAction {
  type: ActionType;
  payload?: Record<string, unknown>;
}

// ---------- Product ----------
export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  badge?: string;
}

// ---------- Component props ----------
export interface BannerHeroProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  cta?: { label: string; action: SDUIAction };
}

export interface ProductGrid2x2Props {
  title?: string;
  products: Product[];
}

export interface DynamicCollectionProps {
  title: string;
  products: Product[];
}

export interface FullScreenOverlayProps {
  animationUrl?: string;
  /** 'confetti' | 'water-splash' | 'lottie' — drives which built-in animation runs */
  animationType?: 'confetti' | 'water-splash' | 'lottie' | 'sparkle';
  durationMs?: number;
  dismissAction?: SDUIAction;
}

// ---------- Discriminated union for SDUI nodes ----------
export type SDUINode =
  | { id: string; type: 'BANNER_HERO'; props: BannerHeroProps }
  | { id: string; type: 'PRODUCT_GRID_2X2'; props: ProductGrid2x2Props }
  | { id: string; type: 'DYNAMIC_COLLECTION'; props: DynamicCollectionProps }
  | { id: string; type: 'FULL_SCREEN_OVERLAY'; props: FullScreenOverlayProps }
  // Unknown components: still typed so we can fail gracefully.
  | { id: string; type: string; props: Record<string, unknown> };

// ---------- Campaign payload ----------
export interface CampaignPayload {
  campaignId: string;
  campaignName: string;
  theme: ThemeConfig;
  components: SDUINode[];
}
