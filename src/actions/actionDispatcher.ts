import { Alert, Linking } from 'react-native';
import { resolveProductById } from '../data/productResolver';
import { useCampaignStore } from '../store/campaignStore';
import { useCartStore } from '../store/cartStore';
import { SDUIAction } from '../types/sdui';

type Handler = (action: SDUIAction) => void;

const handlers: Record<string, Handler> = {
  ADD_TO_CART: (action) => {
    const productId = action.payload?.productId as string | undefined;
    if (!productId) return;
    useCartStore.getState().add(productId);
  },

  REMOVE_FROM_CART: (action) => {
    const productId = action.payload?.productId as string | undefined;
    if (!productId) return;
    useCartStore.getState().remove(productId);
  },

  DEEP_LINK: (action) => {
    const url = action.payload?.url as string | undefined;
    if (!url) return;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Navigation', `Would open: ${url}`);
      }
    });
  },

  OPEN_PRODUCT: (action) => {
    const productId = action.payload?.productId as string | undefined;
    const product = productId ? resolveProductById(productId) : undefined;
    Alert.alert(
      product?.title ?? 'Product details',
      product
        ? `$${product.price.toFixed(2)} - Added to today's curated collection.`
        : `Product ID: ${productId ?? 'unknown'}`,
    );
  },

  APPLY_COUPON: (action) => {
    const code = (action.payload?.code as string | undefined) ?? 'MYSTERY';
    Alert.alert('Coupon applied', `Code: ${code}`);
  },

  SWITCH_CAMPAIGN: (action) => {
    const campaignId = action.payload?.campaignId as string | undefined;
    if (!campaignId) return;
    useCampaignStore.getState().switchTo(campaignId);
  },

  DISMISS_OVERLAY: () => {
    // Hook point for analytics or future global overlay state.
  },

  NOOP: () => {},
};

export function handleAction(action: SDUIAction | undefined | null): void {
  if (!action) return;
  const handler = handlers[action.type];
  if (!handler) {
    console.warn(`[actionDispatcher] Unknown action type: ${action.type}`);
    return;
  }
  handler(action);
}
