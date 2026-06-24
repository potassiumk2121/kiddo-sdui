import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProductGrid2x2Props, Product } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';
import { ProductCard } from './ProductCard';
import { resolveProductSource } from '../data/productResolver';

interface RawProps extends Omit<ProductGrid2x2Props, 'products'> {
  /** Either a literal product array OR a string source resolved at runtime. */
  products?: Product[];
  productSource?: string;
}

function ProductGrid2x2Impl(props: RawProps) {
  const theme = useTheme();

  // Resolve products from either inline array or source string. Memoized so
  // referential equality stays stable while the parent feed re-renders.
  const products = useMemo<Product[]>(() => {
    if (props.products && props.products.length > 0) return props.products;
    if (props.productSource) return resolveProductSource(props.productSource).slice(0, 4);
    return [];
  }, [props.products, props.productSource]);

  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      {props.title ? (
        <Text style={[styles.title, { color: theme.text }]}>{props.title}</Text>
      ) : null}
      <View style={styles.grid}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </View>
    </View>
  );
}

export const ProductGrid2x2 = memo(ProductGrid2x2Impl);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, paddingTop: 8 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
