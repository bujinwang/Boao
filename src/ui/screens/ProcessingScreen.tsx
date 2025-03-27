import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

interface ProcessingStep {
  title: string;
  description: string;
  icon: string;
}

const processingSteps: ProcessingStep[] = [
  {
    title: 'OCR Scanning',
    description: 'Converting image to text with advanced OCR...',
    icon: '🔍'
  },
  {
    title: 'Data Extraction',
    description: 'Identifying patient information and medical details...',
    icon: '📊'
  },
  {
    title: 'AI Analysis',
    description: 'Analyzing medical context with advanced AI...',
    icon: '🧠'
  },
  {
    title: 'Billing Code Generation',
    description: 'Inferring appropriate billing codes and modifiers...',
    icon: '💡'
  },
  {
    title: 'Final Verification',
    description: 'AI proofreading and accuracy check...',
    icon: '✨'
  }
];

type ProcessingScreenRouteProp = RouteProp<RootStackParamList, 'ProcessingScreen'>;

const ProcessingScreen = () => {
  const route = useRoute<ProcessingScreenRouteProp>();
  const { onCancel, onComplete } = route.params;
  
  const [currentStep, setCurrentStep] = useState(0);
  const spinValue = new Animated.Value(0);
  const progressValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.95);

  // Spinning animation for the loading icon
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Progress through steps
  useEffect(() => {
    const stepDuration = 2000; // 2 seconds per step
    const timer = setInterval(() => {
      if (currentStep < processingSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        animateNewStep();
      } else {
        clearInterval(timer);
        setTimeout(onComplete, 1000);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [currentStep, onComplete]);

  const animateNewStep = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(progressValue, {
        toValue: (currentStep + 1) / processingSteps.length,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start(() => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Loading Icon */}
        <Animated.Text 
          style={[
            styles.loadingIcon,
            { transform: [{ rotate: spin }] }
          ]}
        >
          {processingSteps[currentStep].icon}
        </Animated.Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              { width: progressWidth }
            ]}
          />
        </View>

        {/* Step Information */}
        <Animated.View
          style={[
            styles.stepInfo,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.stepTitle}>
            {processingSteps[currentStep].title}
          </Text>
          <Text style={styles.stepDescription}>
            {processingSteps[currentStep].description}
          </Text>
        </Animated.View>

        {/* Step Indicators */}
        <View style={styles.stepIndicators}>
          {processingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index === currentStep && styles.activeStepDot,
              ]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 30,
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginBottom: 30,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 2,
  },
  stepInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: '#1976D2',
    transform: [{ scale: 1.2 }],
  },
  cancelButton: {
    position: 'absolute',
    bottom: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProcessingScreen; 