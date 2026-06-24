import React, { useCallback, useMemo } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SDUINode } from '../types/sdui';
import { useActiveComponents } from '../store/campaignStore';
import { useTheme } from '../theme/ThemeContext';
import { SectionRenderer } from '../components/SectionRenderer';
import { CartCounter } from '../components/CartCounter';
import { CampaignSwitcher } from '../components/CampaignSwitcher';

/**
 * HomeScreen
 *
 * The entire homepage is rendered as ONE FlashList. Each row is a SDUI node.
 *
 * Performance contract:
 *   - FlashList with `estimatedItemSize` for virtualization.
 *   - `renderItem` and `keyExtractor` are stable callbacks (useCallback).
 *   - `SectionRenderer` is memoized on node identity → cart updates DON'T
 *     re-render the feed; only the touched ProductCard + CartCounter update.
 *   - Overlays render in a separate absolutely-positioned layer with
 *     pointerEvents="none" so they never block the feed.
 *
 * Overlays are filtered OUT of the FlashList data and rendered as a sibling
 * layer — this keeps the list pure (one item type) and prevents the overlay
 * from claiming list space.
 */
export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const components = useActiveComponents();

  const { feed, overlays } = useMemo(() => {
    const f: SDUINode[] = [];
    const o: SDUINode[] = [];
    for (const node of components) {
      if (node.type === 'FULL_SCREEN_OVERLAY') o.push(node);
      else f.push(node);
    }
    return { feed: f, overlays: o };
  }, [components]);

  const renderItem = useCallback<ListRenderItem<SDUINode>>(
    ({ item }) => <SectionRenderer node={item} />,
    [],
  );

  const keyExtractor = useCallback((item: SDUINode) => item.id, []);

  // FlashList wants a per-type override only when row types vary in size.
  // We provide it to let the recycler pool match heights better.
  const overrideItemLayout = useCallback(
    (layout: { size?: number }, item: SDUINode) => {
      switch (item.type) {
        case 'BANNER_HERO':
          layout.size = 220;
          break;
        case 'PRODUCT_GRID_2X2':
          layout.size = 480;
          break;
        case 'DYNAMIC_COLLECTION':
          layout.size = 260;
          break;
        default:
          layout.size = 100;
      }
    },
    [],
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <StatusBar
        barStyle={
          // Dark text on light backgrounds (carnival has a dark bg though)
          theme.background.toLowerCase() === '#2e1a47'
            ? 'light-content'
            : 'dark-content'
        }
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.brand, { color: theme.text }]}>SDUI Shop</Text>
        <CartCounter />
      </View>

      {/* Campaign switcher (driven from JSON config) */}
      <CampaignSwitcher />

      {/* Single feed */}
      <FlashList
        data={feed}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={300}
        overrideItemLayout={overrideItemLayout}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
      />

      {/* Overlay layer — non-blocking */}
      {overlays.map((node) => (
        <SectionRenderer key={node.id} node={node} />
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  brand: { fontSize: 22, fontWeight: '800' },
  listContent: { paddingBottom: 24 },
});
