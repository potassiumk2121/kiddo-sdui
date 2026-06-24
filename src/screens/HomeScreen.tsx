import React, { useCallback, useMemo } from 'react';
import { StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartCounter } from '../components/CartCounter';
import { CampaignSwitcher } from '../components/CampaignSwitcher';
import { SectionRenderer } from '../components/SectionRenderer';
import { useActiveComponents } from '../store/campaignStore';
import { SDUINode } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const components = useActiveComponents();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

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

  const overrideItemLayout = useCallback(
    (layout: { size?: number }, item: SDUINode) => {
      switch (item.type) {
        case 'BANNER_HERO':
          layout.size = isWide ? 300 : 246;
          break;
        case 'PRODUCT_GRID_2X2':
          layout.size = isWide ? 390 : 470;
          break;
        case 'DYNAMIC_COLLECTION':
          layout.size = 330;
          break;
        default:
          layout.size = 100;
      }
    },
    [isWide],
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.headerInner}>
          <View style={styles.brandCluster}>
            <View style={[styles.logoMark, { backgroundColor: theme.primary }]}>
              <Text style={styles.logoText}>K</Text>
            </View>
            <View style={styles.brandCopy}>
              <Text style={[styles.brand, { color: theme.text }]}>
                Kiddo Shop
              </Text>
              <Text style={[styles.brandSub, { color: theme.textMuted }]}>
                Premium picks for kids
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {isWide ? (
              <View style={[styles.deliveryPill, { backgroundColor: theme.surface }]}>
                <Text style={[styles.deliveryTitle, { color: theme.text }]}>
                  Delivery in 10 mins
                </Text>
                <Text style={[styles.deliverySub, { color: theme.textMuted }]}>
                  Fresh deals today
                </Text>
              </View>
            ) : null}
            <CartCounter />
          </View>
        </View>
      </View>

      <CampaignSwitcher />

      <FlashList
        data={feed}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={300}
        overrideItemLayout={overrideItemLayout}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
      />

      {overlays.map((node) => (
        <SectionRenderer key={node.id} node={node} />
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.18)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  headerInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
  },
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 11,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandCopy: { minWidth: 0 },
  brand: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandSub: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  deliveryPill: {
    minWidth: 174,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EEF9',
  },
  deliveryTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  deliverySub: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 28,
  },
});
