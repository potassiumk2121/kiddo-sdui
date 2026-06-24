import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { handleAction } from '../actions/actionDispatcher';
import { BannerHeroProps } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';

const MAX_CONTENT_WIDTH = 1180;

function BannerHeroImpl(props: BannerHeroProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [isRevealed, setIsRevealed] = useState(false);
  const pressScale = useRef(new Animated.Value(1)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const heroIn = useRef(new Animated.Value(0)).current;
  const isWide = screenWidth >= 860;
  const heroHeight = isWide ? 270 : 218;

  useEffect(() => {
    Animated.timing(heroIn, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [heroIn]);

  useEffect(() => {
    if (!isRevealed) return undefined;

    Animated.sequence([
      Animated.timing(revealOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(revealOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setIsRevealed(false));

    return undefined;
  }, [isRevealed, revealOpacity]);

  const onPress = useCallback(() => {
    if (!props.cta) return;
    setIsRevealed(true);
    handleAction(props.cta.action);
  }, [props.cta]);

  const onPressIn = useCallback(() => {
    if (!props.cta) return;
    Animated.spring(pressScale, {
      toValue: 0.99,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [pressScale, props.cta]);

  const onPressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const content = (
    <View style={[styles.content, isWide ? styles.contentWide : null]}>
      <View style={[styles.kicker, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
        <Text style={styles.kickerText}>Kiddo special</Text>
      </View>
      <Text
        style={[
          styles.title,
          { fontSize: isWide ? 34 : 25, lineHeight: isWide ? 40 : 31 },
        ]}
      >
        {props.title}
      </Text>
      {props.subtitle ? (
        <Text
          style={[
            styles.subtitle,
            { maxWidth: isWide ? 460 : 300 },
          ]}
        >
          {props.subtitle}
        </Text>
      ) : null}
      {props.cta ? (
        <View style={styles.actionRow}>
          <View style={[styles.cta, { backgroundColor: theme.accent }]}>
            <Text style={[styles.ctaText, { color: theme.text }]}>
              {props.cta.label}
            </Text>
          </View>
          {isWide ? <Text style={styles.supportText}>Selected deals</Text> : null}
        </View>
      ) : null}
      {isRevealed ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.reveal,
            {
              opacity: revealOpacity,
              transform: [
                {
                  translateY: revealOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.revealText}>Surprise unlocked</Text>
        </Animated.View>
      ) : null}
    </View>
  );

  const layeredContent = (
    <>
      <View style={[styles.baseTint, { backgroundColor: theme.primary }]} />
      <View
        style={[
          styles.sideTint,
          {
            backgroundColor: theme.secondary,
            width: isWide ? '42%' : '58%',
          },
        ]}
      />
      <View style={styles.overlay}>{content}</View>
    </>
  );

  return (
    <Animated.View
      style={[
        styles.shell,
        {
          opacity: heroIn,
          transform: [
            {
              translateY: heroIn.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
            { scale: pressScale },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityRole={props.cta ? 'button' : undefined}
        accessibilityLabel={props.cta ? props.cta.label : props.title}
        disabled={!props.cta}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.container,
          {
            minHeight: heroHeight,
            backgroundColor: theme.primary,
          },
        ]}
      >
        {props.imageUrl ? (
          <ImageBackground
            source={{ uri: props.imageUrl }}
            style={[styles.bg, { minHeight: heroHeight }]}
            imageStyle={styles.bgImage}
            resizeMode="cover"
          >
            {layeredContent}
          </ImageBackground>
        ) : (
          <View style={[styles.bg, { minHeight: heroHeight }]}>
            {layeredContent}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export const BannerHero = memo(BannerHeroImpl);

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  container: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 6,
  },
  bg: {
    width: '100%',
  },
  bgImage: {
    borderRadius: 24,
  },
  baseTint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.82,
  },
  sideTint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0.34,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.24)',
  },
  content: {
    minHeight: 218,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  contentWide: {
    minHeight: 270,
    paddingHorizontal: 42,
    paddingVertical: 34,
  },
  kicker: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  kickerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: 560,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 8,
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  actionRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 2,
  },
  ctaText: { fontWeight: '900', fontSize: 14, letterSpacing: 0 },
  supportText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '800',
  },
  reveal: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  revealText: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
