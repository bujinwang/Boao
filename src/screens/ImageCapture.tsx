import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import type { CameraCapturedPicture } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';

type ImageCaptureRouteProp = RouteProp<RootStackParamList, 'ImageCapture'>;
type ImageCaptureNavigationProp = StackNavigationProp<RootStackParamList, 'ImageCapture'>;

const ImageCapture = () => {
  const navigation = useNavigation<ImageCaptureNavigationProp>();
  const route = useRoute<ImageCaptureRouteProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<any>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 1,
      }) as CameraCapturedPicture;

      if (photo.base64) {
        route.params.onPhotoTaken(photo.base64);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  cancelButton: {
    padding: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default ImageCapture;