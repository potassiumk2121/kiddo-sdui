import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import { FullScreenOverlayProps } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';

/**
 * FullScreenOverlay
 *
 * Critical: `pointerEvents="none"` so the overlay never blocks taps on the
 * feed below — required by the assignment.
 *
 * The overlay auto-dismisses after `durationMs` (default 3500ms).
 *
 * Three lightweight built-in animations driven by `animationType`:
 *   - confetti     → falling colored squares (Carnival)
 *   - water-splash → ripple-expanding circles (Summer Playhouse)
 *   - sparkle      → twinkling dots (Back To School)
 *
 * We avoid requiring `lottie-react-native` at runtime here so the demo works
 * even if Lottie native module isn't linked — but the registry is ready to
 * swap in a Lottie animation via `animation_url` when available.
 */

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

function buildParticles(
  count: number,
  palette: string[],
  sizeRange: [number, number],
): Particle[] {
  const [minS, maxS] = sizeRange;
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * SCREEN_W,
    delay: Math.random() * 1500,
    duration: 2000 + Math.random() * 2000,
    color: palette[i % palette.length]!,
    size: minS + Math.random() * (maxS - minS),
  }));
}

function ConfettiPiece({ particle }: { particle: Particle }) {
  const y = useRef(new Animated.Value(-50)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(y, {
          toValue: SCREEN_H + 50,
          duration: particle.duration,
          delay: particle.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rot, {
          toValue: 1,
          duration: particle.duration,
          delay: particle.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [particle, y, rot]);

  const rotate = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: particle.x,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          transform: [{ translateY: y }, { rotate }],
        },
      ]}
    />
  );
}

function Ripple({ delay, color }: { delay: number; color: string }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 4,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scale, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.ripple,
        { borderColor: color, transform: [{ scale }], opacity },
      ]}
    />
  );
}

function Sparkle({ particle }: { particle: Particle }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [particle, opacity]);

  return (
    <Animated.View
      style={[
        styles.sparkle,
        {
          left: particle.x,
          top: Math.random() * SCREEN_H,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          opacity,
        },
      ]}
    />
  );
}

function FullScreenOverlayImpl(props: FullScreenOverlayProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), props.durationMs ?? 3500);
    return () => clearTimeout(t);
  }, [props.durationMs]);

  const particles = useRef<Particle[]>(
    buildParticles(
      30,
      [theme.primary, theme.secondary, theme.accent, '#ffffff'],
      [6, 14],
    ),
  ).current;

  if (!visible) return null;

  const animationType = props.animationType ?? 'sparkle';

  return (
    // CRITICAL: pointerEvents="none" so taps fall through to the feed below.
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {animationType === 'confetti' &&
        particles.map((p) => <ConfettiPiece key={p.id} particle={p} />)}

      {animationType === 'water-splash' && (
        <View style={styles.center}>
          <Ripple delay={0} color={theme.primary} />
          <Ripple delay={600} color={theme.secondary} />
          <Ripple delay={1200} color={theme.accent} />
        </View>
      )}

      {animationType === 'sparkle' &&
        particles.map((p) => <Sparkle key={p.id} particle={p} />)}

      {animationType === 'lottie' && (
        // Placeholder — wire Lottie here when native module is linked.
        // <LottieView source={{ uri: props.animationUrl }} autoPlay loop={false} />
        <View />
      )}
    </View>
  );
}

export const FullScreenOverlay = memo(FullScreenOverlayImpl);

const styles = StyleSheet.create({
  confetti: { position: 'absolute', top: 0, borderRadius: 2 },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  sparkle: { position: 'absolute', borderRadius: 999 },
  center: {
    position: 'absolute',
    top: SCREEN_H / 2 - 40,
    left: SCREEN_W / 2 - 40,
  },
});
