import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';

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
  }
];

interface ProcessingProps {
  navigation: any;
  route?: any;
  currentStep?: number;
}

const Processing: React.FC<ProcessingProps> = ({
  navigation,
  route,
  currentStep = 0,
}) => {
  const [processingComplete, setProcessingComplete] = useState(false);
  const spinValue = new Animated.Value(0);
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
        animateNewStep();
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setProcessingComplete(true);
          navigation.navigate('DataReview', { imageId: 'sample-image-id' });
        }, 1000);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [currentStep, navigation]);

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
    ]).start(() => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {processingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepIndicator,
                index <= currentStep ? styles.activeStep : styles.inactiveStep,
              ]}
            />
          ))}
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 30,
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
    maxWidth: '80%',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 70,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  activeStep: {
    backgroundColor: '#1976D2',
  },
  inactiveStep: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F44336',
    textDecorationLine: 'underline',
  },
});

export default Processing;