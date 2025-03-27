import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import Dashboard from '../screens/Dashboard';
import ImageCapture from '../screens/ImageCapture';
import ProcessingScreen from '../screens/ProcessingScreen';
import DataReview from '../screens/DataReview';
import EncounterDetails from '../screens/EncounterDetails';

export type RootStackParamList = {
  Dashboard: undefined;
  ImageCapture: {
    onPhotoTaken: (base64: string) => void;
  };
  ProcessingScreen: {
    onComplete: () => void;
    onCancel: () => void;
  };
  DataReview: {
    originalImage?: string;
    imageUri?: string;
    encounterData?: any;
  };
  EncounterDetails: {
    encounterId: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="ImageCapture" component={ImageCapture} />
        <Stack.Screen 
          name="ProcessingScreen" 
          component={ProcessingScreen}
          options={{
            cardStyle: { backgroundColor: '#1A1A1A' },
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="DataReview" component={DataReview} />
        <Stack.Screen name="EncounterDetails" component={EncounterDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;