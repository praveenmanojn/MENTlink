import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/student/HomeScreen';
import StudentAskDoubtScreen from '../screens/student/AskDoubtScreen';
import StudentChatScreen from '../screens/student/ChatScreen';
import StudentHistoryScreen from '../screens/student/HistoryScreen';

const BottomTab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <BottomTab.Navigator>
      <BottomTab.Screen name="Home" component={HomeScreen} />
      <BottomTab.Screen name="Ask Doubt" component={StudentAskDoubtScreen} />
      <BottomTab.Screen name="Chat" component={StudentChatScreen} />
      <BottomTab.Screen name="History" component={StudentHistoryScreen} />
    </BottomTab.Navigator>
  );
};

export default MainTabs;
