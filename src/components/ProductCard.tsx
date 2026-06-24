import React, { memo, useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';
import { useProductQuantity } from '../store/cartStore';
import { handleAction } from '../actions/actionDispatcher';

interface Props {
  product: Product;
  width?: number;
}

/**
 * ProductCard — memoized.
 *
 * Performance contract:
 *  - Wrapped in `React.memo` so prop-equal re-renders are skipped.
 *  - Subscribes only to its OWN quantity via `useProductQuantity(id)`.
 *    => Adding a different product to the cart will NOT re-render this card.
 *  - Action handlers are wrapped in `useCallback` to avoid creating new
 *    function identities on each render.
 */
function ProductCardImpl({ product, width }: Props) {
  const theme = useTheme();
  const quantity = useProductQuantity(product.id);

  const onAdd = useCallback(() => {
    handleAction({
      type: 'ADD_TO_CART',
      payload: { productId: product.id },
    });
  }, [product.id]);

  const onOpen = useCallback(() => {
    handleAction({
      type: 'OPEN_PRODUCT',
      payload: { productId: product.id },
    });
  }, [product.id]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, width: width ?? '48%' },
      ]}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={onOpen}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.badge ? (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {product.title}
      </Text>
      <Text style={[styles.price, { color: theme.textMuted }]}>
        ${product.price.toFixed(2)}
      </Text>

      <TouchableOpacity
        onPress={onAdd}
        style={[styles.cta, { backgroundColor: theme.primary }]}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>
          {quantity > 0 ? `In cart · ${quantity}` : 'Add to cart'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export const ProductCard = memo(ProductCardImpl);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 130,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#000' },
  title: { marginTop: 8, fontSize: 13, fontWeight: '600' },
  price: { marginTop: 2, fontSize: 12 },
  cta: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
