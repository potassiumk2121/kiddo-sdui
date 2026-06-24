import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { handleAction } from '../actions/actionDispatcher';
import { useCampaignStore } from '../store/campaignStore';
import { useTheme } from '../theme/ThemeContext';

const ACCENT_BLUE = '#2563EB';
const ACCENT_BLUE_DARK = '#1D4ED8';
const INACTIVE_TEXT = '#334155';
const MUTED_TEXT = '#64748B';

interface CampaignPillProps {
  id: string;
  index: number;
  isActive: boolean;
  label: string;
  onSelect: (id: string) => void;
}

function CampaignPillImpl({
  id,
  index,
  isActive,
  label,
  onSelect,
}: CampaignPillProps) {
  const activeProgress = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const appearProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(activeProgress, {
      toValue: isActive ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [activeProgress, isActive]);

  useEffect(() => {
    Animated.timing(appearProgress, {
      toValue: 1,
      duration: 260,
      delay: index * 40,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appearProgress, index]);

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 0.97,
      friction: 7,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 7,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const handlePress = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  const textColor = activeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [INACTIVE_TEXT, '#FFFFFF'],
  });

  const activeOpacity = activeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const inactiveBorderOpacity = activeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.pillShell,
        {
          opacity: appearProgress,
          transform: [
            {
              translateY: appearProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
            { scale: pressScale },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pillPressable}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pillFill,
            {
              opacity: activeOpacity,
              backgroundColor: ACCENT_BLUE,
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.inactiveStroke,
            {
              opacity: inactiveBorderOpacity,
            },
          ]}
        />
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.pillText,
            {
              color: textColor,
            },
          ]}
        >
          {label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

const CampaignPill = memo(CampaignPillImpl);

/**
 * Renders a compact segmented campaign selector. Selecting one dispatches a
 * SWITCH_CAMPAIGN action through the existing SDUI action dispatcher.
 */
function CampaignSwitcherImpl() {
  const theme = useTheme();
  const available = useCampaignStore((s) => s.available);
  const activeId = useCampaignStore((s) => s.activeId);

  const onPress = useCallback((id: string) => {
    handleAction({ type: 'SWITCH_CAMPAIGN', payload: { campaignId: id } });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.segmentedRail}>
        <Text style={styles.railLabel}>Campaign</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          style={styles.scroller}
          contentContainerStyle={styles.row}
        >
          {available.map((campaign, index) => (
            <CampaignPill
              key={campaign.id}
              id={campaign.id}
              index={index}
              isActive={campaign.id === activeId}
              label={campaign.name}
              onSelect={onPress}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export const CampaignSwitcher = memo(CampaignSwitcherImpl);

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  segmentedRail: {
    width: '100%',
    maxWidth: 1180,
    height: 48,
    maxHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: '#E0EAFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  railLabel: {
    paddingLeft: 14,
    paddingRight: 8,
    color: MUTED_TEXT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  scroller: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: 48,
  },
  row: {
    minHeight: 48,
    alignItems: 'center',
    paddingRight: 8,
    gap: 8,
  },
  pillShell: {
    height: 36,
    minWidth: 112,
    maxWidth: 190,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  pillPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  pillFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    shadowColor: ACCENT_BLUE_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 2,
  },
  inactiveStroke: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#D9E6FF',
    borderRadius: 18,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 16,
  },
});
