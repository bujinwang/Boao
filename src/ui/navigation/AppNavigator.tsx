import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import Dashboard from '../screens/Dashboard';
import ImageCapture from '../screens/ImageCapture';
import DataReview from '../screens/DataReview';
import EncounterDetails from '../screens/EncounterDetails';
import Processing from '../screens/Processing';

export type RootStackParamList = {
  Dashboard: undefined;
  ImageCapture: {
    onPhotoTaken: (base64: string) => void;
  };
  DataReview: {
    originalImage?: string;
    imageUri?: string;
    encounterData?: any;
    batchImages?: Array<{
      base64: string;
      uri: string;
    }>;
    currentBatchIndex?: number;
  };
  EncounterDetails: {
    encounterId: string;
  };
  Processing: {
    images: Array<{
      base64: string;
      uri: string;
    }>;
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
        <Stack.Screen name="DataReview" component={DataReview} />
        <Stack.Screen name="EncounterDetails" component={EncounterDetails} />
        <Stack.Screen 
          name="Processing" 
          component={Processing}
          options={{
            cardStyle: { backgroundColor: '#F5F7FA' },
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;