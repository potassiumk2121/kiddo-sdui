import React, { memo, useCallback } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from 'react-native';
import { BannerHeroProps } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';
import { handleAction } from '../actions/actionDispatcher';

function BannerHeroImpl(props: BannerHeroProps) {
  const theme = useTheme();
  const onPress = useCallback(() => {
    if (props.cta) handleAction(props.cta.action);
  }, [props.cta]);

  const Inner = (
    <View style={styles.inner}>
      <Text style={[styles.title, { color: '#fff' }]}>{props.title}</Text>
      {props.subtitle ? (
        <Text style={styles.subtitle}>{props.subtitle}</Text>
      ) : null}
      {props.cta ? (
        <TouchableOpacity
          onPress={onPress}
          style={[styles.cta, { backgroundColor: theme.accent }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, { color: theme.text }]}>
            {props.cta.label}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      {props.imageUrl ? (
        <ImageBackground
          source={{ uri: props.imageUrl }}
          style={styles.bg}
          imageStyle={styles.bgImage}
        >
          <View style={styles.overlay}>{Inner}</View>
        </ImageBackground>
      ) : (
        Inner
      )}
    </View>
  );
}

export const BannerHero = memo(BannerHeroImpl);

const styles = StyleSheet.create({
  container: {
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 180,
  },
  bg: { width: '100%', minHeight: 180 },
  bgImage: { borderRadius: 16 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
    justifyContent: 'center',
  },
  inner: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#f5f5f5', fontSize: 14, marginBottom: 12 },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaText: { fontWeight: '700' },
});
// Image import kept tree-shake friendly
void Image;
