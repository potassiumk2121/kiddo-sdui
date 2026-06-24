import { create } from 'zustand';
import { CampaignPayload } from '../types/sdui';
import backToSchool from '../data/campaigns/backToSchool.json';
import summerPlayhouse from '../data/campaigns/summerPlayhouse.json';
import mysteryGiftCarnival from '../data/campaigns/mysteryGiftCarnival.json';

/**
 * Campaign store.
 *
 * The active SDUI payload (theme + components) lives here. Switching campaign
 * is a single state change that propagates everywhere via selective hooks.
 *
 * NOTE: The JSON files are imported statically so Metro bundles them, but
 * conceptually each `CampaignPayload` could come from a remote endpoint.
 */

const CAMPAIGNS: Record<string, CampaignPayload> = {
  back_to_school: backToSchool as CampaignPayload,
  summer_playhouse: summerPlayhouse as CampaignPayload,
  mystery_gift_carnival: mysteryGiftCarnival as CampaignPayload,
};

interface CampaignState {
  available: { id: string; name: string }[];
  activeId: string;
  payload: CampaignPayload;
  switchTo: (campaignId: string) => void;
}

const initialId = 'back_to_school';

export const useCampaignStore = create<CampaignState>((set) => ({
  available: Object.values(CAMPAIGNS).map((c) => ({
    id: c.campaignId,
    name: c.campaignName,
  })),
  activeId: initialId,
  payload: CAMPAIGNS[initialId]!,
  switchTo: (campaignId) => {
    const next = CAMPAIGNS[campaignId];
    if (!next) {
      // Fail gracefully — keep current payload.
      console.warn(`[campaignStore] Unknown campaign: ${campaignId}`);
      return;
    }
    set({ activeId: campaignId, payload: next });
  },
}));

/** Subscribes only to the theme — avoids re-rendering when components change. */
export const useActiveTheme = () => useCampaignStore((s) => s.payload.theme);

/** Subscribes only to the components array. */
export const useActiveComponents = () =>
  useCampaignStore((s) => s.payload.components);
