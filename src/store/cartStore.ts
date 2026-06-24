import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

/**
 * Cart state managed by Zustand.
 *
 * Why Zustand instead of Redux/Context here?
 * 1. Selective subscriptions: components only re-render when *their* slice
 *    of state changes (e.g. ProductCard subscribes to `items[productId]`,
 *    CartCounter subscribes to `count`). Context would re-render the whole
 *    subtree.
 * 2. No boilerplate / providers — works seamlessly with FlashList rows.
 */

export interface CartLine {
  productId: string;
  quantity: number;
}

interface CartState {
  items: Record<string, CartLine>;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: {},
  add: (productId) =>
    set((state) => {
      const current = state.items[productId];
      const next: CartLine = {
        productId,
        quantity: (current?.quantity ?? 0) + 1,
      };
      return { items: { ...state.items, [productId]: next } };
    }),
  remove: (productId) =>
    set((state) => {
      const current = state.items[productId];
      if (!current) return state;
      if (current.quantity <= 1) {
        const { [productId]: _omit, ...rest } = state.items;
        return { items: rest };
      }
      return {
        items: {
          ...state.items,
          [productId]: { ...current, quantity: current.quantity - 1 },
        },
      };
    }),
  clear: () => set({ items: {} }),
}));

/**
 * Selector hook for a single product's quantity.
 * Returning a primitive ensures referential equality — the component
 * only re-renders when *this product's* quantity changes.
 */
export const useProductQuantity = (productId: string): number =>
  useCartStore((s) => s.items[productId]?.quantity ?? 0);

/**
 * Selector hook for the total item count (used by the cart badge).
 * Computed from items — `shallow` keeps the result stable.
 */
export const useCartCount = (): number =>
  useCartStore((s) => {
    let total = 0;
    for (const key in s.items) {
      total += s.items[key]!.quantity;
    }
    return total;
  });

export { shallow };
