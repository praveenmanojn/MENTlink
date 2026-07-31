/**
 * PaperBottomNav
 * Custom paper-strip bottom navigation bar.
 * Looks like a torn piece of paper pinned at the bottom.
 * Replaces the glassmorphism tab bar in MainTabs.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const TAB_ICONS: Record<string, string> = {
  Home: '⌂',
  Dashboard: '⌂',
  'Ask Doubt': '?',
  AskDoubt: '?',
  Chat: '✉',
  History: '⟳',
  Requests: '!',
  Ratings: '★',
  Users: '⊞',
  Analytics: '≋',
  Profile: '◉',
  Activity: '◎',
  Notifications: '◆',
};

const TAB_LABELS: Record<string, string> = {
  'Ask Doubt': 'Ask',
  AskDoubt: 'Ask',
  Home: 'Home',
  Dashboard: 'Home',
  Chat: 'Chat',
  History: 'History',
  Requests: 'Requests',
  Ratings: 'Ratings',
  Users: 'Users',
  Analytics: 'Stats',
  Profile: 'Profile',
  Activity: 'Activity',
  Notifications: 'Alerts',
};

const PaperBottomNav: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.strip}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const routeName = route.name;
          const label = TAB_LABELS[routeName] ?? routeName;
          const icon = TAB_ICONS[routeName] ?? '•';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={[styles.tab, isFocused && styles.tabActive]}
            >
              {isFocused && <View style={styles.activePin} />}
              <Text style={[styles.icon, isFocused && styles.iconActive]}>{icon}</Text>
              <Text
                style={[styles.label, isFocused && styles.labelActive]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 6,
    backgroundColor: Colors.notebookBg,
    borderTopWidth: 3,
    borderTopColor: Colors.borderBlack,
  },
  strip: {
    flexDirection: 'row',
    backgroundColor: Colors.paperWhite,
    borderWidth: 3,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    overflow: 'visible',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: Colors.stickyYellow,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: Colors.borderBlack,
  },
  activePin: {
    position: 'absolute',
    top: -10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.pinRed,
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    zIndex: 10,
  },
  icon: {
    fontSize: 18,
    color: Colors.inkLight,
    lineHeight: 22,
  },
  iconActive: {
    color: Colors.inkBlack,
    fontWeight: '900',
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xxs,
    color: Colors.inkLight,
    marginTop: 1,
  },
  labelActive: {
    fontFamily: FontFamily.bold,
    color: Colors.inkBlack,
  },
});

export default PaperBottomNav;
