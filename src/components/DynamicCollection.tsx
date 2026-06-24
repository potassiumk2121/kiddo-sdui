import React, { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { resolveProductSource } from '../data/productResolver';
import { DynamicCollectionProps, Product } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';
import { ProductCard } from './ProductCard';

interface RawProps extends Omit<DynamicCollectionProps, 'products'> {
  products?: Product[];
  productSource?: string;
}

const MAX_CONTENT_WIDTH = 1180;
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 14;

function DynamicCollectionImpl(props: RawProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth >= 900 ? 178 : 154;
  const snapInterval = cardWidth + CARD_GAP;

  const products = useMemo<Product[]>(() => {
    if (props.products && props.products.length > 0) return props.products;
    if (props.productSource) return resolveProductSource(props.productSource);
    return [];
  }, [props.products, props.productSource]);

  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => (
      <View style={[styles.cardWrap, { width: cardWidth, marginRight: CARD_GAP }]}>
        <ProductCard product={item} width={cardWidth} />
      </View>
    ),
    [cardWidth],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Product> | null | undefined, index: number) => ({
      length: snapInterval,
      offset: snapInterval * index,
      index,
    }),
    [snapInterval],
  );

  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>
              More to explore
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              {props.title}
            </Text>
          </View>
          <Text style={[styles.hint, { color: theme.textMuted }]}>Popular</Text>
        </View>
        <FlatList
          horizontal
          data={products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={7}
          windowSize={5}
          removeClippedSubviews
          snapToInterval={snapInterval}
          decelerationRate="fast"
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

export const DynamicCollection = memo(DynamicCollectionImpl);

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    paddingBottom: 18,
  },
  inner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  headingRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    letterSpacing: 0,
  },
  hint: {
    fontSize: 12,
    fontWeight: '800',
    paddingBottom: 3,
  },
  listContent: {
    paddingLeft: HORIZONTAL_PADDING,
    paddingRight: 2,
  },
  cardWrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
});
