import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { handleAction } from '../actions/actionDispatcher';
import { useProductQuantity } from '../store/cartStore';
import { Product } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  product: Product;
  width?: number;
}

function ProductCardImpl({ product, width }: Props) {
  const theme = useTheme();
  const quantity = useProductQuantity(product.id);
  const imageScale = useRef(new Animated.Value(1)).current;
  const actionScale = useRef(new Animated.Value(1)).current;
  const cardIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardIn, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [cardIn]);

  useEffect(() => {
    if (quantity === 0) return;
    Animated.sequence([
      Animated.spring(actionScale, {
        toValue: 1.04,
        friction: 5,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.spring(actionScale, {
        toValue: 1,
        friction: 6,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [actionScale, quantity]);

  const onAdd = useCallback(() => {
    handleAction({
      type: 'ADD_TO_CART',
      payload: { productId: product.id },
    });
  }, [product.id]);

  const onRemove = useCallback(() => {
    handleAction({
      type: 'REMOVE_FROM_CART',
      payload: { productId: product.id },
    });
  }, [product.id]);

  const onOpen = useCallback(() => {
    handleAction({
      type: 'OPEN_PRODUCT',
      payload: { productId: product.id },
    });
  }, [product.id]);

  const pressImageIn = useCallback(() => {
    Animated.spring(imageScale, {
      toValue: 0.98,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [imageScale]);

  const pressImageOut = useCallback(() => {
    Animated.spring(imageScale, {
      toValue: 1,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [imageScale]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: '#E5EEF9',
          width: width ?? '48%',
          opacity: cardIn,
          transform: [
            {
              translateY: cardIn.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${product.title}`}
        onPress={onOpen}
        onPressIn={pressImageIn}
        onPressOut={pressImageOut}
      >
        <Animated.View style={[styles.imageWrap, { transform: [{ scale: imageScale }] }]}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageSheen} />
          {product.badge ? (
            <View style={[styles.badge, { backgroundColor: theme.accent }]}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          ) : null}
        </Animated.View>
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.text }]}>
            ${product.price.toFixed(2)}
          </Text>
          <Text style={[styles.delivery, { color: theme.textMuted }]}>
            Fast delivery
          </Text>
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale: actionScale }] }}>
        {quantity > 0 ? (
          <View style={[styles.stepper, { borderColor: theme.primary }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove one ${product.title}`}
              onPress={onRemove}
              style={styles.stepperButton}
            >
              <Text style={[styles.stepperSymbol, { color: theme.primary }]}>
                -
              </Text>
            </Pressable>
            <Text style={[styles.quantity, { color: theme.primary }]}>
              {quantity}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add one more ${product.title}`}
              onPress={onAdd}
              style={styles.stepperButton}
            >
              <Text style={[styles.stepperSymbol, { color: theme.primary }]}>
                +
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.title} to cart`}
            onPress={onAdd}
            style={[styles.cta, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.ctaText}>Add</Text>
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}

export const ProductCard = memo(ProductCardImpl);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 10,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#EEF6FF',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF6FF',
  },
  imageSheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#172033',
    letterSpacing: 0,
  },
  content: {
    minHeight: 66,
    paddingTop: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    letterSpacing: 0,
  },
  priceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
  },
  delivery: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
  },
  cta: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  stepper: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 13,
    backgroundColor: '#F8FBFF',
    overflow: 'hidden',
  },
  stepperButton: {
    width: 42,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSymbol: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '900',
  },
  quantity: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '900',
  },
});
