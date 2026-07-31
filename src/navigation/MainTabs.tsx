import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';

// Student screens
import HomeScreen from '../screens/student/HomeScreen';
import StudentAskDoubtScreen from '../screens/student/AskDoubtScreen';
import StudentChatScreen from '../screens/student/ChatScreen';
import StudentHistoryScreen from '../screens/student/HistoryScreen';

// Mentor / Teacher screens
import MentorDashboardScreen from '../screens/mentor/DashboardScreen';
import MentorRequestsScreen from '../screens/mentor/RequestsScreen';
import MentorChatScreen from '../screens/mentor/ChatScreen';
import MentorRatingsScreen from '../screens/mentor/RatingsScreen';

// Admin screens
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';
import AdminAnalyticsScreen from '../screens/admin/AnalyticsScreen';

// Shared Profile Screen
import ProfileScreen from '../screens/student/ProfileScreen';
import { theme } from '../theme';

const BottomTab = createBottomTabNavigator();

const MainTabs = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || 'student';

  return (
    <BottomTab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { fontWeight: 'bold', color: theme.colors.text },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
      }}
    >
      {role === 'mentor' ? (
        <>
          <BottomTab.Screen name="Dashboard" component={MentorDashboardScreen} />
          <BottomTab.Screen name="Requests" component={MentorRequestsScreen} />
          <BottomTab.Screen name="Chat" component={MentorChatScreen} />
          <BottomTab.Screen name="Ratings" component={MentorRatingsScreen} />
          <BottomTab.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : role === 'admin' ? (
        <>
          <BottomTab.Screen name="Dashboard" component={AdminDashboardScreen} />
          <BottomTab.Screen name="Users" component={AdminUsersScreen} />
          <BottomTab.Screen name="Analytics" component={AdminAnalyticsScreen} />
          <BottomTab.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <>
          <BottomTab.Screen name="Home" component={HomeScreen} />
          <BottomTab.Screen name="Ask Doubt" component={StudentAskDoubtScreen} />
          <BottomTab.Screen name="Chat" component={StudentChatScreen} />
          <BottomTab.Screen name="History" component={StudentHistoryScreen} />
          <BottomTab.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </BottomTab.Navigator>
  );
};

export default MainTabs;
