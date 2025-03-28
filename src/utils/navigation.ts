import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types/navigation';

// Type-safe stack navigation hook
export const useStackNavigation = () => {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
};

// Type-safe tab navigation hook
export const useTabNavigation = () => {
  return useNavigation<BottomTabNavigationProp<TabParamList>>();
};

// Type-safe route hook
export const useAppRoute = () => {
  return useRoute();
};

// Stack navigation helpers
export const stackNavigationHelpers = {
  goToDashboard: (navigation: NativeStackNavigationProp<RootStackParamList>) => {
    navigation.navigate('Dashboard');
  },
  goToDataReview: (navigation: NativeStackNavigationProp<RootStackParamList>) => {
    navigation.navigate('DataReview');
  },
  goToProcessing: (navigation: NativeStackNavigationProp<RootStackParamList>) => {
    navigation.navigate('Processing');
  },
  goToImageCapture: (navigation: NativeStackNavigationProp<RootStackParamList>) => {
    navigation.navigate('ImageCapture');
  },
  goToEncounterDetails: (navigation: NativeStackNavigationProp<RootStackParamList>) => {
    navigation.navigate('EncounterDetails');
  },
  goBack: (navigation: NativeStackNavigationProp<RootStackParamList>) => {
    navigation.goBack();
  },
};

// Tab navigation helpers
export const tabNavigationHelpers = {
  goToHome: (navigation: BottomTabNavigationProp<TabParamList>) => {
    navigation.navigate('HomeTab');
  },
  goToStatements: (navigation: BottomTabNavigationProp<TabParamList>) => {
    navigation.navigate('StatementsTab');
  },
  goToSettings: (navigation: BottomTabNavigationProp<TabParamList>) => {
    navigation.navigate('SettingsTab');
  },
};

// Custom hook for checking if we're on the first screen
export const useIsFirstScreen = () => {
  const index = useNavigationState((state) => state?.index ?? 0);
  return index === 0;
};

// Custom hook for checking if we can go back
export const useCanGoBack = () => {
  const navigation = useStackNavigation();
  return navigation.canGoBack();
};

// Custom hook for getting current screen name
export const useCurrentScreen = () => {
  const route = useAppRoute();
  return route.name;
}; 