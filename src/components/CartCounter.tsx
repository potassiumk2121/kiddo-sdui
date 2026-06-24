import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { handleAction } from '../actions/actionDispatcher';
import { resolveProductById } from '../data/productResolver';
import { shallow, useCartCount, useCartStore } from '../store/cartStore';
import { useTheme } from '../theme/ThemeContext';

function CartCounterImpl() {
  const theme = useTheme();
  const count = useCartCount();
  const items = useCartStore((s) => s.items, shallow);
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const badgeScale = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const sheetProgress = useRef(new Animated.Value(0)).current;
  const isWide = width >= 860;
  const drawerWidth = Math.min(420, Math.max(320, width - 32));

  const lines = useMemo(
    () =>
      Object.values(items).map((line) => ({
        ...line,
        product: resolveProductById(line.productId),
      })),
    [items],
  );

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (total, line) => total + (line.product?.price ?? 0) * line.quantity,
        0,
      ),
    [lines],
  );

  useEffect(() => {
    Animated.sequence([
      Animated.spring(badgeScale, {
        toValue: 1.16,
        friction: 5,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 6,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [badgeScale, count]);

  useEffect(() => {
    if (!isOpen) return;
    sheetProgress.setValue(0);
    Animated.timing(sheetProgress, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOpen, sheetProgress]);

  const sheetAnimatedStyle = isWide
    ? {
        transform: [
          {
            translateX: sheetProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [drawerWidth, 0],
            }),
          },
        ],
      }
    : {
        transform: [
          {
            translateY: sheetProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [420, 0],
            }),
          },
        ],
      };

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const pressIn = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 0.96,
      friction: 7,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const pressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 7,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const removeItem = useCallback((productId: string) => {
    handleAction({
      type: 'REMOVE_FROM_CART',
      payload: { productId },
    });
  }, []);

  return (
    <>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open cart, ${count} items`}
          onPress={openCart}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={[styles.wrap, { backgroundColor: theme.surface }]}
        >
          <Text style={[styles.label, { color: theme.textMuted }]}>Cart</Text>
          <Animated.View
            style={[
              styles.badge,
              {
                backgroundColor: theme.primary,
                transform: [{ scale: badgeScale }],
              },
            ]}
          >
            <Text style={styles.badgeText}>{count}</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={closeCart}
      >
        <Pressable
          style={[styles.backdrop, isWide ? styles.backdropWide : null]}
          onPress={closeCart}
        >
          <Animated.View style={sheetAnimatedStyle}>
            <Pressable
              onPress={(event) => event.stopPropagation()}
              style={[
                styles.sheet,
                isWide
                  ? [styles.sheetWide, { width: drawerWidth }]
                  : styles.sheetMobile,
                { backgroundColor: theme.background },
              ]}
            >
              <View style={isWide ? styles.sideHandle : styles.handle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={[styles.sheetTitle, { color: theme.text }]}>
                    Your Cart
                  </Text>
                  <Text style={[styles.sheetSub, { color: theme.textMuted }]}>
                    {count === 1 ? '1 item added' : `${count} items added`}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close cart"
                  onPress={closeCart}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>Close</Text>
                </Pressable>
              </View>

              {lines.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    Your cart is empty
                  </Text>
                  <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                    Add a product and it will appear here instantly.
                  </Text>
                </View>
              ) : (
                <>
                  <ScrollView
                    style={isWide ? styles.itemsWide : styles.items}
                    contentContainerStyle={styles.itemsContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {lines.map((line) => (
                      <View
                        key={line.productId}
                        style={[
                          styles.itemRow,
                          { backgroundColor: theme.surface },
                        ]}
                      >
                        {line.product?.image ? (
                          <Image
                            source={{ uri: line.product.image }}
                            style={styles.itemImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.itemImageFallback}>
                            <Text style={styles.itemImageFallbackText}>?</Text>
                          </View>
                        )}

                        <View style={styles.itemInfo}>
                          <Text
                            numberOfLines={1}
                            style={[styles.itemTitle, { color: theme.text }]}
                          >
                            {line.product?.title ?? line.productId}
                          </Text>
                          <Text
                            style={[
                              styles.itemMeta,
                              { color: theme.textMuted },
                            ]}
                          >
                            Qty {line.quantity} - $
                            {((line.product?.price ?? 0) * line.quantity).toFixed(
                              2,
                            )}
                          </Text>
                        </View>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${line.product?.title ?? line.productId}`}
                          onPress={() => removeItem(line.productId)}
                          style={[
                            styles.removeButton,
                            { borderColor: theme.primary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.removeText,
                              { color: theme.primary },
                            ]}
                          >
                            -
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={styles.footer}>
                    <View>
                      <Text
                        style={[styles.footerLabel, { color: theme.textMuted }]}
                      >
                        Subtotal
                      </Text>
                      <Text style={[styles.footerTotal, { color: theme.text }]}>
                        ${subtotal.toFixed(2)}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={closeCart}
                      style={[
                        styles.checkoutButton,
                        { backgroundColor: theme.primary },
                      ]}
                    >
                      <Text style={styles.checkoutText}>Continue shopping</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

export const CartCounter = memo(CartCounterImpl);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 7,
    borderWidth: 1,
    borderColor: '#E5EEF9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: '900', letterSpacing: 0 },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.46)',
  },
  backdropWide: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  sheetMobile: {
    width: '100%',
    maxHeight: '78%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetWide: {
    height: '100%',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 14,
  },
  sideHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 23, fontWeight: '900', letterSpacing: 0 },
  sheetSub: { marginTop: 2, fontSize: 13, fontWeight: '700' },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EEF4FF',
  },
  closeText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900' },
  emptySub: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  items: { maxHeight: 360 },
  itemsWide: { flex: 1 },
  itemsContent: { gap: 10, paddingBottom: 4 },
  itemRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5EEF9',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  itemImageFallback: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  itemImageFallbackText: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '900',
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 0 },
  itemMeta: { marginTop: 4, fontSize: 12, fontWeight: '700' },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  removeText: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingTop: 14,
  },
  footerLabel: { fontSize: 12, fontWeight: '800' },
  footerTotal: { marginTop: 2, fontSize: 21, fontWeight: '900' },
  checkoutButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 16,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
