import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import Swipeable from 'react-native-gesture-handler/Swipeable';

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
    return (
      <TouchableOpacity 
        style={styles.activityItem}
        onPress={() => handleActivityPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.activityHeader}>
          <View style={styles.activityHeaderLeft}>
            <View style={styles.patientNameContainer}>
              <Text style={styles.patientName}>{item.patientName}</Text>
              {item.hasMatchingRecord ? (
                <View style={styles.returningPatientBadge}>
                  <Text style={styles.returningPatientIcon}>✓</Text>
                  <Text style={styles.returningPatientText}>Existing Patient</Text>
                </View>
              ) : (
                <View style={styles.newPatientBadge}>
                  <Text style={styles.newPatientIcon}>⚠️</Text>
                  <Text style={styles.newPatientText}>New Patient</Text>
                </View>
              )}
            </View>
            <Text style={styles.date}>{item.date}</Text>
          </View>
          <View style={styles.activityHeaderRight}>
            <Text style={[
              styles.status,
              item.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
            ]}>
              {item.status.toUpperCase()}
            </Text>
            {item.isFlagged && (
              <View style={styles.flagIndicator}>
                <Text style={styles.flagText}>⚠️</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.activityContent}>
          <View style={styles.activityRow}>
            <Text style={styles.label}>AHN:</Text>
            <Text style={styles.value}>{item.ahn}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={styles.label}>DOB:</Text>
            <Text style={styles.value}>{item.dateOfBirth}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={styles.label}>Reason:</Text>
            <Text style={styles.value}>{item.reason}</Text>
          </View>
          
          <View style={styles.activityRow}>
            <Text style={styles.label}>Diagnosis:</Text>
            <Text style={styles.value}>{item.diagnosis.join(', ')}</Text>
          </View>

          <View style={styles.activityRow}>
            <Text style={styles.label}>Procedures:</Text>
            <Text style={styles.value}>{item.procedures.join(', ')}</Text>
          </View>

          <View style={styles.billingSummary}>
            <View style={styles.billingCodes}>
              {item.billingCodes.map((code, index) => (
                <View key={code.code} style={styles.billingCode}>
                  <Text style={styles.billingCodeText}>
                    {code.code} {code.modifier ? `(${code.modifier})` : ''}
                  </Text>
                  <Text style={styles.billingAmount}>
                    ${(code.modifiedPrice || code.basePrice).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.totalAmount}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${item.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { padding: 20 * scale }]}>
        <Text style={[styles.title, { fontSize: 24 * scale }]}>Boao Medical Billing</Text>
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
          contentContainerStyle={[
            styles.activityListContent,
            isTablet && styles.activityListContentTablet
          ]}
        >
          {activityItems.map((item) => (
            <Swipeable
              key={item.id}
              renderRightActions={() => renderRightActions(item)}
              renderLeftActions={() => renderLeftActions(item)}
              containerStyle={[
                isTablet && styles.swipeableContainerTablet
              ]}
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
          <Text style={[styles.statAmount, { fontSize: 32 * scale }]}>$12,450</Text>
          <Text style={[styles.statComparison, { fontSize: 14 * scale }]}>+8% from last month</Text>
        </View>
        
        <View style={[styles.statWidget, { padding: 20 * scale }]}>
          <Text style={[styles.statTitle, { fontSize: 18 * scale }]}>Pending Submissions</Text>
          <Text style={[styles.statAmount, styles.pendingAmount, { fontSize: 32 * scale }]}>12</Text>
          <Text style={[styles.statText, { fontSize: 14 * scale }]}>Submissions ready</Text>
        </View>
      </View>

      {/* Navigation Bar */}
      <View style={[styles.navbar, { height: 80 * scale }]}>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.activeIndicator, { width: 20 * scale, height: 3 * scale }]} />
          <Text style={[styles.navText, styles.activeNavText, { fontSize: 14 * scale }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navText, { fontSize: 14 * scale }]}>Records</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navText, { fontSize: 14 * scale }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
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
  activityListContentTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  swipeableContainerTablet: {
    width: '48.5%', // Leave some gap between columns
  },
  activityItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityHeaderLeft: {
    flex: 1,
  },
  patientNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
  activityHeaderRight: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusConfirmed: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  flagIndicator: {
    marginTop: 4,
  },
  flagText: {
    fontSize: 16,
  },
  activityContent: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  activityRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 100,
    fontSize: 14,
    color: '#666666',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  billingSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  billingCodes: {
    marginBottom: 8,
  },
  billingCode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  billingCodeText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  billingAmount: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  totalAmount: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingBottom: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 12,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 3,
    backgroundColor: '#1976D2',
    borderRadius: 1.5,
  },
  navText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666666',
  },
  activeNavText: {
    color: '#1976D2',
    fontWeight: '500',
  },
  newPatientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newPatientIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  newPatientText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '500',
  },
  returningPatientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  returningPatientIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  returningPatientText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
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
});

export default Dashboard;
