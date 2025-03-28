import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootParamList } from '../types/navigation';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator; 