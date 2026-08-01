/**
 * MaintenanceScreen — MENTlink
 * High-impact notebook-style maintenance screen shown to users when System Maintenance is toggled ON by Admin.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import Button from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { useMaintenanceStore } from '../../store/maintenanceStore';

export const MaintenanceScreen = () => {
  const fetchMaintenanceStatus = useMaintenanceStore((s) => s.fetchMaintenanceStatus);
  const isMaintenanceMode = useMaintenanceStore((s) => s.isMaintenanceMode);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <View style={styles.container}>
          <View style={styles.cardWrapper}>
            <View style={styles.pin}>
              <PinWidget color={Colors.pinRed} size={24} />
            </View>

            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>🛠️</Text>
              </View>

              <Text style={styles.title}>System Under Maintenance</Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>SERVICE TEMPORARILY PAUSED</Text>
              </View>

              <Text style={styles.message}>
                MENTlink is currently undergoing scheduled system upgrades and maintenance by our administrators to improve your experience.
              </Text>

              <Text style={styles.subMessage}>
                Please check back shortly! All chats, doubt posts, and scheduled calls will resume as soon as maintenance completes.
              </Text>

              <View style={styles.divider} />

              <Button
                title="🔄 Check System Status"
                onPress={fetchMaintenanceStatus}
                variant="primary"
                size="md"
                style={styles.refreshBtn}
              />
            </View>
          </View>
        </View>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  pin: {
    marginBottom: -12,
    zIndex: 10,
  },
  card: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3.5,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    transform: [{ rotate: '-0.6deg' }],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.stickyYellow,
    borderWidth: 2.5,
    borderColor: Colors.borderBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    elevation: 3,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xl,
    color: Colors.inkBlack,
    textAlign: 'center',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: Colors.stickyRed,
    borderWidth: 1.5,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xxs,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  message: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.inkDark,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  subMessage: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.inkMedium,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.borderLight,
    marginBottom: 20,
  },
  refreshBtn: {
    width: '100%',
  },
});

export default MaintenanceScreen;
