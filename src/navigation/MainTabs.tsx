import { BottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/student/HomeScreen';
import ActivityScreen from '../screens/student/ActivityScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import MentorDashboardScreen from '../screens/mentor/DashboardScreen';
import MentorRequestsScreen from '../screens/mentor/RequestsScreen';
import MentorChatScreen from '../screens/mentor/ChatScreen';
import MentorRatingsScreen from '../screens/mentor/RatingsScreen';
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';
import AdminAnalyticsScreen from '../screens/admin/AnalyticsScreen';
import StudentAskDoubtScreen from '../screens/student/AskDoubtScreen';
import StudentChatScreen from '../screens/student/ChatScreen';
import StudentHistoryScreen from '../screens/student/HistoryScreen';

const MainTabs = () => {
  return (
    <BottomTab.Navigator>
      <BottomTab.Screen name="Home" component={HomeScreen} />
      <BottomTab.Screen name="Activity" component={ActivityScreen} />
      <BottomTab.Screen name="Notifications" component={NotificationsScreen} />
      <BottomTab.Screen name="Profile" component={ProfileScreen} />
    </BottomTab.Navigator>
  );
};

export default MainTabs;