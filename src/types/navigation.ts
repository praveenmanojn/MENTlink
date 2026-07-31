import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Splash: undefined;
  Login: { role?: 'student' | 'mentor' } | undefined;
  Register: { role?: 'student' | 'mentor' } | undefined;
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
};

export type AuthStackNavigationProp<T extends keyof AuthStackParamList> =
  NativeStackNavigationProp<AuthStackParamList, T>;

export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  BottomTabNavigationProp<MainTabParamList, T>;
