import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import PaperBottomNav from '../components/common/PaperBottomNav';

// Student screens
import HomeScreen from '../screens/student/HomeScreen';
import StudentAskDoubtScreen from '../screens/student/AskDoubtScreen';
import StudentChatScreen from '../screens/student/ChatScreen';
import StudentHistoryScreen from '../screens/student/HistoryScreen';
import StudentProfileScreen from '../screens/student/ProfileScreen';

// Mentor / Teacher screens
import MentorDashboardScreen from '../screens/mentor/DashboardScreen';
import MentorRequestsScreen from '../screens/mentor/RequestsScreen';
import MentorChatScreen from '../screens/mentor/ChatScreen';
import MentorRatingsScreen from '../screens/mentor/RatingsScreen';
import MentorProfileScreen from '../screens/mentor/MentorProfileScreen';

// Admin screens
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';
import AdminAnalyticsScreen from '../screens/admin/AnalyticsScreen';
import AdminProfileScreen from '../screens/student/ProfileScreen';

const BottomTab = createBottomTabNavigator();

const MainTabs = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || 'student';

  return (
    <BottomTab.Navigator
      tabBar={(props) => <PaperBottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {role === 'mentor' ? (
        <>
          <BottomTab.Screen name="Dashboard" component={MentorDashboardScreen} />
          <BottomTab.Screen name="Requests" component={MentorRequestsScreen} />
          <BottomTab.Screen name="Chat" component={MentorChatScreen} />
          <BottomTab.Screen name="Ratings" component={MentorRatingsScreen} />
          <BottomTab.Screen name="Profile" component={MentorProfileScreen} />
        </>
      ) : role === 'admin' ? (
        <>
          <BottomTab.Screen name="Dashboard" component={AdminDashboardScreen} />
          <BottomTab.Screen name="Users" component={AdminUsersScreen} />
          <BottomTab.Screen name="Analytics" component={AdminAnalyticsScreen} />
          <BottomTab.Screen name="Profile" component={AdminProfileScreen} />
        </>
      ) : (
        <>
          <BottomTab.Screen name="Home" component={HomeScreen} />
          <BottomTab.Screen name="Ask Doubt" component={StudentAskDoubtScreen} />
          <BottomTab.Screen name="Chat" component={StudentChatScreen} />
          <BottomTab.Screen name="History" component={StudentHistoryScreen} />
          <BottomTab.Screen name="Profile" component={StudentProfileScreen} />
        </>
      )}
    </BottomTab.Navigator>
  );
};

export default MainTabs;
