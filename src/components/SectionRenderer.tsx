import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SDUINode } from '../types/sdui';
import { resolveComponent } from '../registry/componentRegistry';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  node: SDUINode;
}

/**
 * Renders one SDUI node by looking it up in the registry.
 *
 * Unknown types → graceful fallback (renders nothing in production, a small
 * dev hint in development).
 *
 * The wrapper is memoized so unchanged nodes don't re-render when other
 * sections of the feed update.
 */
function SectionRendererImpl({ node }: Props) {
  const theme = useTheme();
  const Component = resolveComponent(node.type);

  if (!Component) {
    if (__DEV__) {
      return (
        <View style={[styles.unknown, { borderColor: theme.textMuted }]}>
          <Text style={[styles.unknownText, { color: theme.textMuted }]}>
            ⚠️ Unknown component type: "{node.type}"
          </Text>
        </View>
      );
    }
    return null;
  }

  return <Component {...node.props} />;
}

export const SectionRenderer = memo(SectionRendererImpl, (prev, next) => {
  // Re-render only if the node identity OR shallow props change.
  // Since campaign payloads come from JSON (immutable per switch), `node`
  // referential equality is a strong signal.
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
