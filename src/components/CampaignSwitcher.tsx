import React, { memo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useCampaignStore } from '../store/campaignStore';
import { useTheme } from '../theme/ThemeContext';
import { handleAction } from '../actions/actionDispatcher';

/**
 * Renders a horizontal pill list of campaigns. Selecting one dispatches a
 * SWITCH_CAMPAIGN action — proving that even campaign switching is just
 * another SDUI action (no special component code).
 */
function CampaignSwitcherImpl() {
  const theme = useTheme();
  const available = useCampaignStore((s) => s.available);
  const activeId = useCampaignStore((s) => s.activeId);

  const onPress = useCallback((id: string) => {
    handleAction({ type: 'SWITCH_CAMPAIGN', payload: { campaignId: id } });
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {available.map((c) => {
        const isActive = c.id === activeId;
        return (
          <TouchableOpacity
            key={c.id}
            onPress={() => onPress(c.id)}
            activeOpacity={0.8}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? theme.primary : theme.surface,
                borderColor: theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: isActive ? '#fff' : theme.text },
              ]}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export const CampaignSwitcher = memo(CampaignSwitcherImpl);

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: { fontSize: 13, fontWeight: '600' },
});
