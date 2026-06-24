import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCartCount } from '../store/cartStore';
import { useTheme } from '../theme/ThemeContext';

/**
 * CartCounter subscribes only to the aggregate count — adding items
 * causes only this component (and the touched ProductCard) to re-render.
 */
function CartCounterImpl() {
  const theme = useTheme();
  const count = useCartCount();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.surface }]}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Cart</Text>
      <View style={[styles.badge, { backgroundColor: theme.primary }]}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    </View>
  );
}

export const CartCounter = memo(CartCounterImpl);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  label: { fontSize: 12, fontWeight: '600' },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
