import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, useWindowDimensions, Animated, Easing, SafeAreaView } from 'react-native';
import { RootStackParamList } from '../types/navigation';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProcessingPipeline } from '../core/services/ProcessingPipeline';
import { ImageSource } from '../core/models/ImageSource';
import { OCRResult } from '../ocr/models/OCRTypes';
import { EncounterDataBuilder } from '../extraction/builders/EncounterDataBuilder';
import { PatientDataBuilder } from '../extraction/builders/PatientDataBuilder';

type NavigationBillingCodeSuggestion = {
  code: {
    code: string;
    description: string;
    fee: number;
  };
  confidence: number;
  reasoning: string;
};

type ProcessingRouteProp = RouteProp<RootStackParamList, 'Processing'>;
type ProcessingNavigationProp = StackNavigationProp<RootStackParamList, 'Processing'>;

interface ProcessingProps {
  navigation: ProcessingNavigationProp;
  route: ProcessingRouteProp;
}

interface ProcessingImage {
  base64: string;
  uri: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  ocrResults?: OCRResult[];
  patientData?: any;
  encounterData?: any;
  billingCodeSuggestions?: NavigationBillingCodeSuggestion[];
}

const Processing: React.FC<ProcessingProps> = ({ navigation, route }) => {
  const { images } = route.params;
  const [processingImages, setProcessingImages] = useState<ProcessingImage[]>(
    images.map(img => ({ ...img, status: 'pending', progress: 0 }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);
  const progressAnim = new Animated.Value(0);
  const pipeline = ProcessingPipeline.getInstance();

  useEffect(() => {
    processImages();
  }, []);

  const updateImageProgress = (
    index: number, 
    progress: number, 
    status: ProcessingImage['status'] = 'processing', 
    results?: { 
      ocrResults?: OCRResult[],
      patientData?: any,
      encounterData?: any,
      billingCodeSuggestions?: NavigationBillingCodeSuggestion[]
    }
  ) => {
    setProcessingImages(prev => 
      prev.map((img, idx) => 
        idx === index 
          ? { 
              ...img, 
              status, 
              progress,
              ocrResults: results?.ocrResults,
              patientData: results?.patientData,
              encounterData: results?.encounterData,
              billingCodeSuggestions: results?.billingCodeSuggestions
            } 
          : img
      )
    );

    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const processImages = async () => {
    setIsProcessing(true);

    try {
      const updatedImages = [...processingImages];
      
      for (let i = 0; i < updatedImages.length; i++) {
        console.log(`Processing image ${i}...`);
        updatedImages[i].status = 'processing';
        updatedImages[i].progress = 0;
        setProcessingImages([...updatedImages]);

        // Create ImageSource object
        const imageSource: ImageSource = {
          id: `image-${i}`,
          data: updatedImages[i].base64,
          timestamp: new Date(),
          source: 'file-import'
        };

        try {
          // Process image through pipeline
          console.log('Calling pipeline.process with imageSource:', imageSource.id);
          updatedImages[i].progress = 25;
          setProcessingImages([...updatedImages]);
          
          const results = await pipeline.process(imageSource);
          
          if (!results.patientData || !results.encounterData) {
            throw new Error('Pipeline returned incomplete data');
          }
          
          // Update image with results
          updatedImages[i] = {
            ...updatedImages[i],
            status: 'completed',
            progress: 100,
            patientData: results.patientData,
            encounterData: results.encounterData,
            billingCodeSuggestions: results.billingCodeSuggestions
          };
          
          setProcessingImages([...updatedImages]);
          setCompletedCount(prev => prev + 1);
          setCurrentIndex(i + 1);
          
          // If this is the first image and it processed successfully, proceed to data review
          if (i === 0) {
            try {
              const patientData = results.patientData;
              const encounterData = results.encounterData;
              const billingSuggestions = results.billingCodeSuggestions;

              // Ensure dates are serialized before navigation
              const serializedPatientData = {
                ...patientData,
                dateOfBirth: patientData.dateOfBirth instanceof Date ? patientData.dateOfBirth.toISOString() : patientData.dateOfBirth
              };

              const serializedEncounterData = {
                ...encounterData,
                date: encounterData.date instanceof Date ? encounterData.date.toISOString() : encounterData.date
              };

              // Navigate to DataReview with the extracted data
              navigation.navigate('DataReview', {
                patientData: serializedPatientData,
                encounterData: serializedEncounterData,
                billingCodeSuggestions: billingSuggestions,
                originalImage: updatedImages[i].base64,
                imageUri: updatedImages[i].uri,
                batchImages: updatedImages.map(img => ({
                  base64: img.base64,
                  uri: img.uri
                }))
              });
              
              return; // Exit after successful navigation
            } catch (error) {
              console.error('Error building records:', error);
              throw error;
            }
          }
        } catch (error: any) {
          console.error(`Error processing image ${i}:`, error);
          updatedImages[i].status = 'error';
          updatedImages[i].progress = 0;
          updatedImages[i].error = error.message || 'An error occurred during processing';
          setProcessingImages([...updatedImages]);
          
          // If this was the first image, show error and stop processing
          if (i === 0) {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error in processImages:', error);
      const errorMessage = 'No patient or encounter data available';
      console.error(errorMessage, {
        processingImages: processingImages.map(img => ({
          status: img.status,
          hasPatientData: !!img.patientData,
          hasEncounterData: !!img.encounterData,
          error: img.error
        }))
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: ProcessingImage['status']): [string, string] => {
    switch (status) {
      case 'completed': return ['#34A853', '#2E7D32'];
      case 'processing': return ['#4285F4', '#1565C0'];
      case 'error': return ['#EA4335', '#C62828'];
      default: return ['#9AA0A6', '#757575'];
    }
  };

  const getStatusText = (status: ProcessingImage['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'error': return 'Error';
      default: return 'Pending';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Processing Images</Text>
          <Text style={styles.subtitle}>
            {completedCount} of {processingImages.length} images processed
          </Text>
        </View>

        <ScrollView style={styles.imageList} showsVerticalScrollIndicator={false}>
          {processingImages.map((image, index) => (
            <View key={index} style={styles.imageItem}>
              <Image 
                source={{ uri: image.uri }} 
                style={styles.thumbnail}
              />
              <View style={styles.imageInfo}>
                <Text style={styles.imageNumber}>Image {index + 1}</Text>
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${image.progress}%`, backgroundColor: getStatusColor(image.status)[0] }
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {getStatusText(image.status)} {image.progress}%
                  </Text>
                </View>
                {image.error && (
                  <Text style={styles.errorText}>{image.error}</Text>
                )}
                {image.ocrResults && (
                  <Text style={styles.ocrText}>
                    {image.ocrResults.length} text blocks detected
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => {
            if (isProcessing) {
              navigation.navigate('Dashboard');
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#5F6368',
    fontWeight: '500',
  },
  imageList: {
    flex: 1,
    padding: 20,
  },
  imageItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 20,
    backgroundColor: '#E8EAED',
  },
  imageInfo: {
    flex: 1,
  },
  imageNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 12,
  },
  progressContainer: {
    height: 24,
    backgroundColor: '#F1F3F4',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 12,
  },
  statusText: {
    position: 'absolute',
    left: 12,
    top: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
  },
  errorText: {
    fontSize: 14,
    color: '#EA4335',
    marginTop: 8,
    fontWeight: '500',
  },
  ocrText: {
    fontSize: 14,
    color: '#34A853',
    marginTop: 8,
    fontWeight: '500',
  },
  cancelButton: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Processing; 