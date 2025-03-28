import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import Swipeable from 'react-native-gesture-handler/Swipeable';

// Update the logo SVG with a simpler, modern design
const logoIconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Simple background -->
  <rect width="32" height="32" rx="8" fill="#1976D2"/>
  
  <!-- Minimal medical symbol -->
  <path d="M16 8V24M8 16H24" 
    stroke="white" 
    stroke-width="2.5" 
    stroke-linecap="round" 
    stroke-linejoin="round"/>
  
  <!-- Subtle dot -->
  <circle cx="16" cy="16" r="2" fill="white"/>
</svg>`;

// Import SVG assets
const cameraIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 12C13.1 12 14 11.1 14 10C14 8.9 13.1 8 12 8C10.9 8 10 8.9 10 10C10 11.1 10.9 12 12 12ZM12 14C10.67 14 9 13.33 9 10C9 6.67 10.67 6 12 6C13.33 6 15 6.67 15 10C15 13.33 13.33 14 12 14Z" fill="currentColor"/>
  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18Z" fill="currentColor"/>
</svg>`;

const importIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor"/>
</svg>`;

const approveIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
</svg>`;

const editIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.05c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
</svg>`;

const deleteIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
</svg>`;

const flagIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" fill="currentColor"/>
</svg>`;

const batchIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
  <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z" fill="currentColor"/>
</svg>`;

interface BillingCode {
  code: string;
  description: string;
  basePrice: number;
  modifier?: string;
  modifiedPrice?: number;
}

interface ActivityItem {
  id: string;
  patientName: string;
  date: string;
  billingCodes: BillingCode[];
  status: 'confirmed' | 'pending';
  diagnosis: string[];
  procedures: string[];
  reason: string;
  isFlagged?: boolean;
  totalAmount: number;
  isNewPatient?: boolean;
  ahn?: string;  // Alberta Health Number
  dateOfBirth?: string;
  hasMatchingRecord?: boolean;  // Whether patient exists in database
}

interface DashboardProps {
  navigation: any;
}

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 428;
  const isTablet = width >= 768; // iPad breakpoint
  
  // Scale factors based on screen size
  const scale = isSmallScreen ? 0.9 : isMediumScreen ? 1 : 1.1;

  // Add state for activity items
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([
    {
      id: '1',
      patientName: 'John Doe',
      date: '10/15/2023',
      ahn: '1234-5678-9012-3456',
      dateOfBirth: '1980-01-15',
      billingCodes: [
        {
          code: 'E11.9',
          description: 'Type 2 diabetes without complications',
          basePrice: 85.50,
          modifier: 'CMGP',
          modifiedPrice: 102.60
        },
        {
          code: 'I10',
          description: 'Essential hypertension',
          basePrice: 65.75,
          modifier: 'CMGP',
          modifiedPrice: 78.90
        }
      ],
      status: 'confirmed',
      diagnosis: ['Hypertension', 'Type 2 Diabetes'],
      procedures: ['Comprehensive assessment'],
      reason: 'Annual physical examination',
      isFlagged: true,
      totalAmount: 181.50,
      hasMatchingRecord: true,
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      date: '10/14/2023',
      ahn: '2345-6789-0123-4567',
      dateOfBirth: '1975-03-22',
      billingCodes: [
        {
          code: 'I10',
          description: 'Essential hypertension',
          basePrice: 65.75,
          modifier: 'CMGP',
          modifiedPrice: 78.90
        }
      ],
      status: 'confirmed',
      diagnosis: ['Essential hypertension'],
      procedures: ['Blood pressure monitoring'],
      reason: 'Follow-up visit',
      totalAmount: 78.90,
      hasMatchingRecord: true,
    },
    {
      id: '3',
      patientName: 'Michael Smith',
      date: '10/13/2023',
      ahn: '3456-7890-1234-5678',
      dateOfBirth: '1990-08-10',
      billingCodes: [
        {
          code: 'J45.909',
          description: 'Unspecified asthma',
          basePrice: 95.25,
          modifier: 'CALL',
          modifiedPrice: 119.06
        }
      ],
      status: 'pending',
      diagnosis: ['Unspecified asthma'],
      procedures: ['Pulmonary function test'],
      reason: 'Respiratory issues',
      totalAmount: 119.06,
      hasMatchingRecord: false,
    },
    {
      id: '4',
      patientName: 'Emily Wilson',
      date: '10/12/2023',
      ahn: '4567-8901-2345-6789',
      dateOfBirth: '1985-11-28',
      billingCodes: [
        {
          code: 'M54.5',
          description: 'Low back pain',
          basePrice: 75.00,
        }
      ],
      status: 'pending',
      diagnosis: ['Lower back pain'],
      procedures: ['Physical therapy evaluation'],
      reason: 'Back pain assessment',
      totalAmount: 75.00,
      hasMatchingRecord: true,
    },
    {
      id: '5',
      patientName: 'Robert Chen',
      date: '10/11/2023',
      ahn: '5678-9012-3456-7890',
      dateOfBirth: '1992-05-15',
      billingCodes: [
        {
          code: 'J30.1',
          description: 'Allergic rhinitis due to pollen',
          basePrice: 55.00,
          modifier: 'CMGP',
          modifiedPrice: 66.00
        }
      ],
      status: 'pending',
      diagnosis: ['Seasonal allergies'],
      procedures: ['Allergy assessment'],
      reason: 'Allergy symptoms',
      totalAmount: 66.00,
      hasMatchingRecord: true,
    },
    {
      id: '6',
      patientName: 'Maria Garcia',
      date: '10/10/2023',
      ahn: '6789-0123-4567-8901',
      dateOfBirth: '1988-09-20',
      billingCodes: [
        {
          code: 'O26.821',
          description: 'Pregnancy examination',
          basePrice: 120.00,
          modifier: 'COMP',
          modifiedPrice: 162.00
        }
      ],
      status: 'confirmed',
      diagnosis: ['Normal pregnancy'],
      procedures: ['Prenatal checkup'],
      reason: 'Routine pregnancy visit',
      totalAmount: 162.00,
      hasMatchingRecord: true,
    },
    {
      id: '7',
      patientName: 'David Kim',
      date: '10/09/2023',
      ahn: '7890-1234-5678-9012',
      dateOfBirth: '1995-12-03',
      billingCodes: [
        {
          code: 'S93.401',
          description: 'Ankle sprain',
          basePrice: 85.00,
          modifier: 'URGN',
          modifiedPrice: 110.50
        }
      ],
      status: 'pending',
      diagnosis: ['Ankle sprain'],
      procedures: ['Physical examination', 'X-ray'],
      reason: 'Sports injury',
      totalAmount: 110.50,
      hasMatchingRecord: false,
    },
    {
      id: '8',
      patientName: 'Lisa Thompson',
      date: '10/08/2023',
      ahn: '8901-2345-6789-0123',
      dateOfBirth: '1972-07-18',
      billingCodes: [
        {
          code: 'G43.909',
          description: 'Migraine, unspecified',
          basePrice: 95.00,
          modifier: 'CALL',
          modifiedPrice: 118.75
        }
      ],
      status: 'confirmed',
      diagnosis: ['Chronic migraine'],
      procedures: ['Neurological examination'],
      reason: 'Severe headache',
      totalAmount: 118.75,
      hasMatchingRecord: true,
    },
    {
      id: '9',
      patientName: 'James Wilson',
      date: '10/07/2023',
      ahn: '9012-3456-7890-1234',
      dateOfBirth: '1968-04-25',
      billingCodes: [
        {
          code: 'K21.9',
          description: 'GERD without esophagitis',
          basePrice: 75.50,
          modifier: 'CMGP',
          modifiedPrice: 90.60
        }
      ],
      status: 'pending',
      diagnosis: ['GERD'],
      procedures: ['Upper GI evaluation'],
      reason: 'Digestive issues',
      totalAmount: 90.60,
      hasMatchingRecord: true,
    },
    {
      id: '10',
      patientName: 'Amanda Lee',
      date: '10/06/2023',
      ahn: '0123-4567-8901-2345',
      dateOfBirth: '1983-02-14',
      billingCodes: [
        {
          code: 'F41.1',
          description: 'Generalized anxiety disorder',
          basePrice: 110.00,
          modifier: 'COMP',
          modifiedPrice: 148.50
        }
      ],
      status: 'confirmed',
      diagnosis: ['Generalized anxiety disorder'],
      procedures: ['Psychiatric evaluation'],
      reason: 'Mental health assessment',
      totalAmount: 148.50,
      hasMatchingRecord: true,
    }
  ]);

  const handleCapturePress = () => {
    navigation.navigate('ImageCapture', {
      onPhotoTaken: (base64: string) => {
        const images = [{
          base64,
          uri: `data:image/jpeg;base64,${base64}`
        }];
        navigation.navigate('Processing', { images });
      }
    });
  };

  const handleImportPress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to import images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          const images = [{
            base64: asset.base64,
            uri: `data:image/jpeg;base64,${asset.base64}`
          }];
          navigation.navigate('Processing', { images });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to import image. Please try again.');
    }
  };

  const handleBatchPress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to import images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const images = result.assets.map(asset => ({
          base64: asset.base64,
          uri: `data:image/jpeg;base64,${asset.base64}`
        }));
        navigation.navigate('Processing', { images });
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to import images. Please try again.');
    }
  };

  const handleActivityPress = (item: ActivityItem) => {
    navigation.navigate('DataReview', { encounterData: item });
  };

  const handleApprove = (id: string) => {
    Alert.alert(
      'Confirm Approval',
      'Are you sure you want to approve this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          style: 'default',
          onPress: () => {
            setActivityItems(prevItems => 
              prevItems.map(item => 
                item.id === id 
                  ? { ...item, status: 'confirmed' }
                  : item
              )
            );
          }
        },
      ]
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this encounter?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setActivityItems(prevItems => 
              prevItems.filter(item => item.id !== id)
            );
          }
        },
      ]
    );
  };

  const handleFlag = (id: string) => {
    // Handle flag in a real app
    console.log('Flag encounter:', id);
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const renderRightActions = (item: ActivityItem) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={[styles.swipeActionButton, styles.editButton]}
          onPress={() => handleActivityPress(item)}
        >
          <View style={styles.swipeActionContent}>
            <SvgXml xml={editIconSvg} width={24} height={24} color="#fff" />
            <Text style={styles.swipeActionText}>Edit</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.swipeActionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <View style={styles.swipeActionContent}>
            <SvgXml xml={deleteIconSvg} width={24} height={24} color="#fff" />
            <Text style={styles.swipeActionText}>Delete</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = (item: ActivityItem) => {
    if (item.status !== 'pending') return null;
    
    return (
      <View style={styles.leftActions}>
        <TouchableOpacity 
          style={[styles.swipeActionButton, styles.approveButton]}
          onPress={() => handleApprove(item.id)}
        >
          <View style={styles.swipeActionContent}>
            <SvgXml xml={approveIconSvg} width={24} height={24} color="#fff" />
            <Text style={styles.swipeActionText}>Approve</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderActivityItem = (item: ActivityItem) => {
    const billingCodesText = item.billingCodes
      .map(code => `${code.code}${code.modifier ? ` (${code.modifier})` : ''}`)
      .join(', ');

    return (
      <TouchableOpacity 
        style={styles.activityItem}
        onPress={() => handleActivityPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{item.patientName}</Text>
              <Text style={styles.date}>{item.date}</Text>
              {item.dateOfBirth && (
                <>
                  <Text style={styles.dateOfBirth}>• {item.dateOfBirth}</Text>
                  <Text style={styles.age}>• {calculateAge(item.dateOfBirth)}y</Text>
                </>
              )}
              <Text style={styles.billingCodes} numberOfLines={1}>• {billingCodesText}</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
              <View style={styles.badges}>
                {item.hasMatchingRecord ? (
                  <View style={styles.returningPatientBadge}>
                    <Text style={styles.returningPatientText}>Existing</Text>
                  </View>
                ) : (
                  <View style={styles.newPatientBadge}>
                    <Text style={styles.newPatientText}>New</Text>
                  </View>
                )}
                <View style={[
                  styles.statusBadge,
                  item.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
                ]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.reason} numberOfLines={1}>{item.reason}</Text>
          <View style={styles.activityDetails}>
            <Text style={styles.detailText} numberOfLines={1}>
              {item.diagnosis[0]}{item.diagnosis.length > 1 ? ` +${item.diagnosis.length - 1}` : ''} • {item.procedures[0]}{item.procedures.length > 1 ? ` +${item.procedures.length - 1}` : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { padding: 20 * scale }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <SvgXml xml={logoIconSvg} width={32 * scale} height={32 * scale} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { fontSize: 24 * scale }]}>Boao Medical Billing</Text>
            <Text style={[styles.copyright, { fontSize: 10 * scale }]}>© 2025 Boao Medical Billing™</Text>
          </View>
        </View>
        <View style={[styles.profileIcon, { width: 40 * scale, height: 40 * scale }]}>
          <Text style={[styles.profileText, { fontSize: 16 * scale }]}>DR</Text>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={[styles.quickActionsContainer, { padding: 20 * scale }]}>
        <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#4285F4' }]} onPress={handleCapturePress}>
          <SvgXml xml={cameraIconSvg} width={24 * scale} height={24 * scale} color="#fff" />
          <Text style={[styles.quickActionText, { fontSize: 16 * scale }]}>Capture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#34A853' }]} onPress={handleImportPress}>
          <SvgXml xml={importIconSvg} width={24 * scale} height={24 * scale} color="#fff" />
          <Text style={[styles.quickActionText, { fontSize: 16 * scale }]}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#FBBC05' }]} onPress={handleBatchPress}>
          <SvgXml xml={batchIconSvg} width={24 * scale} height={24 * scale} color="#fff" />
          <Text style={[styles.quickActionText, { fontSize: 16 * scale }]}>Batch</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Section */}
      <View style={[styles.recentActivityContainer, { padding: 20 * scale }]}>
        <Text style={[styles.sectionTitle, { fontSize: 20 * scale }]}>Recent Encounters</Text>
        <ScrollView 
          style={styles.activityList}
          contentContainerStyle={styles.activityListContent}
        >
          {activityItems.map((item) => (
            <Swipeable
              key={item.id}
              renderRightActions={() => renderRightActions(item)}
              renderLeftActions={() => renderLeftActions(item)}
            >
              {renderActivityItem(item)}
            </Swipeable>
          ))}
        </ScrollView>
      </View>

      {/* Statistics Section */}
      <View style={[styles.statsContainer, { marginTop: 30 * scale }]}>
        <View style={[styles.statWidget, { padding: 20 * scale }]}>
          <Text style={[styles.statTitle, { fontSize: 18 * scale }]}>Monthly Billing</Text>
          <Text style={[styles.statAmount, { fontSize: 32 * scale }]}>$32,450</Text>
          <Text style={[styles.statComparison, { fontSize: 14 * scale }]}>+12% from last month</Text>
        </View>
        
        <View style={[styles.statWidget, { padding: 20 * scale }]}>
          <Text style={[styles.statTitle, { fontSize: 18 * scale }]}>Pending Submissions</Text>
          <Text style={[styles.statAmount, styles.pendingAmount, { fontSize: 32 * scale }]}>12</Text>
          <Text style={[styles.statText, { fontSize: 14 * scale }]}>Submissions ready</Text>
        </View>
      </View>
    </View>
  );
};

// Add SVG icons for navigation
const homeIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" fill="currentColor"/>
</svg>`;

const statementsIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor"/>
  <path d="M8 12h8v2H8v-2zm0 4h8v2H8v-2z" fill="currentColor"/>
</svg>`;

const settingsIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
</svg>`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  copyright: {
    color: '#666666',
    marginTop: 2,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '30%',
    justifyContent: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  recentActivityContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  activityList: {
    flex: 1,
  },
  activityListContent: {
    paddingBottom: 20,
  },
  activityItem: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flex: 1,
    flexWrap: 'wrap',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  dateOfBirth: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  age: {
    fontSize: 14,
    color: '#666666',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  activityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#666666',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
  },
  statusConfirmed: {
    backgroundColor: '#4CAF50',
  },
  statusPending: {
    backgroundColor: '#FFC107',
  },
  newPatientBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newPatientText: {
    fontSize: 11,
    color: '#E65100',
    fontWeight: '500',
  },
  returningPatientBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  returningPatientText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statWidget: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  pendingAmount: {
    color: '#FFC107',
  },
  statComparison: {
    fontSize: 12,
    color: '#4CAF50',
  },
  statText: {
    fontSize: 12,
    color: '#666666',
  },
  rightActions: {
    flexDirection: 'row',
    height: '100%',
  },
  leftActions: {
    flexDirection: 'row',
    height: '100%',
    width: 80,
    backgroundColor: '#4CAF50',
  },
  swipeActionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#1976D2',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  billingCodes: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
});

export default Dashboard;
