import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { transitions } from '../utils/transitions';

import Dashboard from '../screens/Dashboard';
import DataReview from '../screens/DataReview';
import Processing from '../screens/Processing';
import ImageCapture from '../screens/ImageCapture';
import EncounterDetails from '../screens/EncounterDetails';

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000' },
        ...transitions.default,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard}
        options={{
          ...transitions.fade,
        }}
      />
      <Stack.Screen 
        name="ImageCapture" 
        component={ImageCapture}
        options={{
          ...transitions.modal,
        }}
      />
      <Stack.Screen 
        name="DataReview" 
        component={DataReview}
        options={{
          ...transitions.modal,
        }}
      />
      <Stack.Screen 
        name="EncounterDetails" 
        component={EncounterDetails}
        options={{
          ...transitions.default,
        }}
      />
      <Stack.Screen 
        name="Processing" 
        component={Processing}
        options={{
          cardStyle: { backgroundColor: '#F5F7FA' },
          gestureEnabled: false,
          ...transitions.scale,
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator; 