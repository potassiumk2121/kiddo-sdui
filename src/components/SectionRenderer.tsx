import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { resolveComponent } from '../registry/componentRegistry';
import { SDUINode } from '../types/sdui';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  node: SDUINode;
}

function SectionRendererImpl({ node }: Props) {
  const theme = useTheme();
  const Component = resolveComponent(node.type);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (node.type === 'FULL_SCREEN_OVERLAY') return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [node.id, node.type, progress]);

  if (!Component) {
    if (__DEV__) {
      return (
        <View style={[styles.unknown, { borderColor: theme.textMuted }]}>
          <Text style={[styles.unknownText, { color: theme.textMuted }]}>
            Unknown component type: "{node.type}"
          </Text>
        </View>
      );
    }
    return null;
  }

  if (node.type === 'FULL_SCREEN_OVERLAY') {
    return <Component {...node.props} />;
  }

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
      }}
    >
      <Component {...node.props} />
    </Animated.View>
  );
}

export const SectionRenderer = memo(SectionRendererImpl, (prev, next) => {
  return prev.node === next.node;
});

const styles = StyleSheet.create({
  unknown: {
    margin: 12,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  unknownText: { fontSize: 12, fontStyle: 'italic' },
});
