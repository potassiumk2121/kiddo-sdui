import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { resolveProductSource } from '../data/productResolver';
import { Product, ProductGrid2x2Props } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';
import { ProductCard } from './ProductCard';

interface RawProps extends Omit<ProductGrid2x2Props, 'products'> {
  /** Either a literal product array OR a string source resolved at runtime. */
  products?: Product[];
  productSource?: string;
}

const MAX_CONTENT_WIDTH = 1180;
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 14;

function ProductGrid2x2Impl(props: RawProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const products = useMemo<Product[]>(() => {
    if (props.products && props.products.length > 0) return props.products;
    if (props.productSource) return resolveProductSource(props.productSource).slice(0, 4);
    return [];
  }, [props.products, props.productSource]);

  const columns = screenWidth >= 980 ? 4 : 2;
  const contentWidth =
    Math.min(screenWidth, MAX_CONTENT_WIDTH) - HORIZONTAL_PADDING * 2;
  const cardWidth = (contentWidth - CARD_GAP * (columns - 1)) / columns;

  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {props.title ? (
          <View style={styles.headingRow}>
            <View>
              <Text style={[styles.eyebrow, { color: theme.primary }]}>
                Curated picks
              </Text>
              <Text style={[styles.title, { color: theme.text }]}>
                {props.title}
              </Text>
            </View>
            <Text style={[styles.count, { color: theme.textMuted }]}>
              {products.length} items
            </Text>
          </View>
        ) : null}
        <View style={styles.grid}>
          {products.map((product, index) => (
            <View
              key={product.id}
              style={[
                styles.cardSlot,
                {
                  marginRight:
                    (index + 1) % columns === 0 ? 0 : CARD_GAP,
                },
              ]}
            >
              <ProductCard product={product} width={cardWidth} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export const ProductGrid2x2 = memo(ProductGrid2x2Impl);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 14,
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
  count: {
    fontSize: 12,
    fontWeight: '800',
    paddingBottom: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardSlot: {
    flexGrow: 0,
    flexShrink: 0,
  },
});
