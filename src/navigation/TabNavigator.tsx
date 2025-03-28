import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from '../types/navigation';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import StackNavigator from './StackNavigator';
import StatementsScreen from '../screens/StatementsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof TabParamList } }): BottomTabNavigationOptions => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'StatementsTab':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'SettingsTab':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'alert';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={StackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="StatementsTab" component={StatementsScreen} options={{ title: 'Statements' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator; 