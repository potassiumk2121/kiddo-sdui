import { Alert, Linking } from 'react-native';
import { SDUIAction } from '../types/sdui';
import { useCartStore } from '../store/cartStore';
import { useCampaignStore } from '../store/campaignStore';

/**
 * Universal Action Dispatcher.
 *
 * Every component delegates side-effects to `handleAction`. This keeps
 * components dumb (UI only) and makes the SDUI payload portable —
 * the JSON can drive any side-effect without component changes.
 *
 * To add a new action: extend `ActionType` in types/sdui.ts and add a
 * handler in the switch below. No component code needs to change.
 */

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
        Alert.alert('Deep Link', `Would navigate to: ${url}`);
      }
    });
  },

  OPEN_PRODUCT: (action) => {
    const productId = action.payload?.productId as string | undefined;
    Alert.alert('Product', `Open product detail: ${productId ?? 'unknown'}`);
  },

  APPLY_COUPON: (action) => {
    const code = (action.payload?.code as string | undefined) ?? 'MYSTERY';
    Alert.alert('🎁 Coupon Applied', `Code: ${code}`);
  },

  SWITCH_CAMPAIGN: (action) => {
    const campaignId = action.payload?.campaignId as string | undefined;
    if (!campaignId) return;
    useCampaignStore.getState().switchTo(campaignId);
  },

  DISMISS_OVERLAY: () => {
    // Overlays manage their own visibility via local state — this is a hook
    // point for analytics or future global overlay state.
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
