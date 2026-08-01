import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Splash: undefined;
  Login: { role?: 'student' | 'mentor' | 'admin' } | undefined;
  AdminLogin: undefined;
  Register: { role?: 'student' | 'mentor' | 'admin' } | undefined;
  RoleSelection: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  AskDoubt: undefined;
  Chat: undefined;
  History: undefined;
  Activity: undefined;
  Notifications: undefined;
  Profile: undefined;
  Dashboard: undefined;
  Users: undefined;
  Mentors: undefined;
  Analytics: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  NearbyMentors: undefined;
  MentorBooking: { mentorId: string; mentorName: string; rating: number; distance: string } | undefined;
  ScheduleMeeting: { mentorId?: string; mentorName?: string } | undefined;
  AudioSession: undefined;
  CallScreen: {
    sessionId: string;
    callType: 'audio' | 'video';
    channelId: string;
    userId: string;
    userName: string;
  };
};

export type AuthStackNavigationProp<T extends keyof AuthStackParamList> =
  NativeStackNavigationProp<AuthStackParamList, T>;

export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  BottomTabNavigationProp<MainTabParamList, T>;

export type RootStackNavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;
