import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { DynamicCollectionProps, Product } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';
import { ProductCard } from './ProductCard';
import { resolveProductSource } from '../data/productResolver';

interface RawProps extends Omit<DynamicCollectionProps, 'products'> {
  products?: Product[];
  productSource?: string;
}

const CARD_WIDTH = 150;

/**
 * Horizontal scrolling product list. Lives inside the vertical FlashList feed.
 *
 * Performance notes:
 *  - Uses `FlatList` (horizontal) with `removeClippedSubviews`,
 *    `initialNumToRender`, and `windowSize` tuned for smooth scroll.
 *  - `getItemLayout` skips measurement → constant-time scroll-to-index.
 *  - `renderItem` and `keyExtractor` are stable (useCallback).
 *  - Cards are memoized; only the touched card re-renders on cart change.
 */
function DynamicCollectionImpl(props: RawProps) {
  const theme = useTheme();

  const products = useMemo<Product[]>(() => {
    if (props.products && props.products.length > 0) return props.products;
    if (props.productSource) return resolveProductSource(props.productSource);
    return [];
  }, [props.products, props.productSource]);

  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => (
      <View style={styles.cardWrap}>
        <ProductCard product={item} width={CARD_WIDTH} />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Product> | null | undefined, index: number) => ({
      length: CARD_WIDTH + 12,
      offset: (CARD_WIDTH + 12) * index,
      index,
    }),
    [],
  );

  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{props.title}</Text>
      <FlatList
        horizontal
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

export const DynamicCollection = memo(DynamicCollectionImpl);

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  listContent: { paddingHorizontal: 12 },
  cardWrap: { width: CARD_WIDTH, marginRight: 12 },
});
