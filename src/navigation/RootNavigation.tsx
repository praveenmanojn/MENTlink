import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { useAuthStore } from '../store/authStore';
import { useMaintenanceStore } from '../store/maintenanceStore';
import MaintenanceScreen from '../screens/common/MaintenanceScreen';

import NearbyMentorsScreen from '../screens/student/NearbyMentorsScreen';
import MentorBookingScreen from '../screens/student/MentorBookingScreen';
import AudioSessionScreen from '../screens/student/AudioSessionScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminExportDataScreen from '../screens/admin/AdminExportDataScreen';
import AdminSystemLogsScreen from '../screens/admin/AdminSystemLogsScreen';
import AdminMentorsScreen from '../screens/admin/AdminMentorsScreen';
import AdminStudentsScreen from '../screens/admin/AdminStudentsScreen';
import ScheduleMeetingScreen from '../screens/student/ScheduleMeetingScreen';
import CallScreen from '../screens/call/CallScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const isMaintenanceMode = useMaintenanceStore((state) => state.isMaintenanceMode);
  const initRealtimeListener = useMaintenanceStore((state) => state.initRealtimeListener);

  useEffect(() => {
    const unsubscribe = initRealtimeListener();
    return () => unsubscribe();
  }, [initRealtimeListener]);

  // If maintenance mode is turned ON by admin, block non-admin users (students & mentors)
  if (isMaintenanceMode && role !== 'admin') {
    return <MaintenanceScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="NearbyMentors" component={NearbyMentorsScreen} />
            <Stack.Screen name="MentorBooking" component={MentorBookingScreen} />
            <Stack.Screen name="ScheduleMeeting" component={ScheduleMeetingScreen} />
            <Stack.Screen name="AudioSession" component={AudioSessionScreen} />
            <Stack.Screen name="CallScreen" component={CallScreen} />
            <Stack.Screen name="AdminMentors" component={AdminMentorsScreen} />
            <Stack.Screen name="AdminStudents" component={AdminStudentsScreen} />
            <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
            <Stack.Screen name="AdminExportData" component={AdminExportDataScreen} />
            <Stack.Screen name="AdminSystemLogs" component={AdminSystemLogsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
