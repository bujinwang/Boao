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
  ]);

  const handleCapturePress = () => {
    navigation.navigate('ImageCapture', {
      onPhotoTaken: (base64: string) => {
        navigation.navigate('ProcessingScreen', {
          onComplete: () => {
            navigation.navigate('DataReview', { 
              originalImage: base64,
              imageUri: `data:image/jpeg;base64,${base64}`
            });
          },
          onCancel: () => {
            navigation.goBack();
          }
        });
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
          navigation.navigate('ProcessingScreen', {
            onComplete: () => {
              navigation.navigate('DataReview', { 
                originalImage: asset.base64,
                imageUri: `data:image/jpeg;base64,${asset.base64}`
              });
            },
            onCancel: () => {
              navigation.goBack();
            }
          });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to import image. Please try again.');
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
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.swipeActionButton, styles.approveButton]}
            onPress={() => handleApprove(item.id)}
          >
            <View style={styles.swipeActionContent}>
              <SvgXml xml={approveIconSvg} width={24} height={24} color="#fff" />
              <Text style={styles.swipeActionText}>Approve</Text>
            </View>
          </TouchableOpacity>
        )}
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
    return (
      <View style={styles.leftActions}>
        <TouchableOpacity 
          style={[styles.swipeActionButton, styles.flagButton]}
          onPress={() => handleFlag(item.id)}
        >
          <View style={styles.swipeActionContent}>
            <SvgXml xml={flagIconSvg} width={24} height={24} color="#fff" />
            <Text style={styles.swipeActionText}>Flag</Text>
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
        <TouchableOpacity style={styles.quickActionButton} onPress={handleCapturePress}>
          <SvgXml xml={cameraIconSvg} width={24 * scale} height={24 * scale} color="#fff" />
          <Text style={[styles.quickActionText, { fontSize: 16 * scale }]}>Capture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton} onPress={handleImportPress}>
          <SvgXml xml={importIconSvg} width={24 * scale} height={24 * scale} color="#fff" />
          <Text style={[styles.quickActionText, { fontSize: 16 * scale }]}>Import</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Section */}
      <View style={[styles.recentActivityContainer, { padding: 20 * scale }]}>
        <Text style={[styles.sectionTitle, { fontSize: 20 * scale }]}>Recent Activity</Text>
        <ScrollView style={styles.activityList}>
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
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontWeight: 'bold',
    color: '#fff',
  },
  profileIcon: {
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#fff',
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1A1A',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 10,
  },
  quickActionText: {
    color: '#fff',
    marginTop: 8,
  },
  recentActivityContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  activityList: {
    flex: 1,
  },
  activityItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientName: {
    fontWeight: '600',
    color: '#333333',
    marginRight: 10,
  },
  date: {
    color: '#666666',
  },
  activityHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
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
    padding: 4,
  },
  flagText: {
    fontSize: 16,
  },
  activityContent: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  activityRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    color: '#666666',
    width: 80,
  },
  value: {
    flex: 1,
    color: '#333333',
  },
  billingSummary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  billingCodes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  billingCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  billingCodeText: {
    color: '#1976D2',
    marginRight: 8,
  },
  billingAmount: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  totalAmount: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#666666',
    marginRight: 8,
  },
  totalValue: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: '100%',
    width: 240,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: '100%',
    width: 80,
  },
  swipeActionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  swipeActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeActionText: {
    color: '#fff',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#1976D2',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  flagButton: {
    backgroundColor: '#FFC107',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statWidget: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '48%',
    height: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  statTitle: {
    fontWeight: '500',
    color: '#333333',
    marginBottom: 15,
  },
  statAmount: {
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  pendingAmount: {
    color: '#FFC107',
  },
  statComparison: {
    color: '#4CAF50',
  },
  statText: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    backgroundColor: '#1976D2',
    borderRadius: 1.5,
    position: 'absolute',
    top: -10,
  },
  navText: {
    color: '#666666',
    marginTop: 5,
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
    gap: 4,
  },
  newPatientIcon: {
    fontSize: 14,
  },
  newPatientText: {
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
    gap: 4,
  },
  returningPatientIcon: {
    fontSize: 14,
  },
  returningPatientText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
});

export default Dashboard;