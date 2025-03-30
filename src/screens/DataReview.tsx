import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, useWindowDimensions, SafeAreaView, Modal, FlatList } from 'react-native';
import { PatientData } from '../extraction/models/PatientData';
import { EncounterData } from '../extraction/models/EncounterData';
import { OCRResult } from '../ocr/models/OCRTypes';
import { BillingCodeSuggestion } from '../billing/models/BillingCode';
import { BillingCode, BILLING_CATEGORIES } from '../extraction/models/BillingCodes';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types/navigation';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import BillingCodeSelector from '../components/BillingCodeSelector';

type DataReviewRouteProp = RouteProp<RootStackParamList, 'DataReview'>;
type DataReviewNavigationProp = StackNavigationProp<RootStackParamList, 'DataReview'>;

interface DataReviewProps {
  navigation: DataReviewNavigationProp;
  route: DataReviewRouteProp;
}

interface NavigationBillingCodeSuggestion {
  code: {
    code: string;
    description: string;
    fee: number;
  };
  confidence: number;
  reasoning: string;
}

const DataReview: React.FC<DataReviewProps> = ({ navigation, route }) => {
  const { originalImage, imageUri, batchImages, patientData: initialPatientData, encounterData: initialEncounterData, billingCodeSuggestions } = route.params;
  const { width } = useWindowDimensions();
  const scale = width < 375 ? 0.9 : width < 428 ? 1 : 1.1;

  // Add logging to debug data passing
  useEffect(() => {
    console.log('Billing Code Suggestions:', billingCodeSuggestions);
  }, [billingCodeSuggestions]);

  const [isEditing, setIsEditing] = useState(false);
  const [isBillingModalVisible, setIsBillingModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  // Initialize state with the provided data or defaults
  const [patientData, setPatientData] = useState<PatientData>(() => {
    // Parse date of birth carefully
    let parsedDateOfBirth = new Date();
    if (initialPatientData?.dateOfBirth) {
      const dob = new Date(initialPatientData.dateOfBirth);
      if (!isNaN(dob.getTime())) {
        parsedDateOfBirth = dob;
      } else {
        console.warn('Invalid date of birth:', initialPatientData.dateOfBirth);
      }
    }

    return {
      fullName: initialPatientData?.fullName || '',
      firstName: initialPatientData?.firstName || '',
      lastName: initialPatientData?.lastName || '',
      dateOfBirth: parsedDateOfBirth,
      healthcareNumber: initialPatientData?.healthcareNumber || '',
      gender: initialPatientData?.gender || '',
      address: initialPatientData?.address || '',
      phoneNumber: initialPatientData?.phoneNumber || '',
      email: initialPatientData?.email || ''
    };
  });

  const [encounterData, setEncounterData] = useState<EncounterData>({
    date: initialEncounterData?.date 
      ? new Date(initialEncounterData.date)
      : new Date(),
    reason: initialEncounterData?.reason || '',
    diagnosis: initialEncounterData?.diagnosis || [],
    procedures: initialEncounterData?.procedures || [],
    notes: initialEncounterData?.notes || '',
    provider: initialEncounterData?.provider || '',
    location: initialEncounterData?.location || '',
    billingCodes: initialEncounterData?.billingCodes || [],
    totalAmount: initialEncounterData?.totalAmount || 0,
    status: initialEncounterData?.status || 'pending'
  });

  // Initialize billing codes from either encounter data or suggestions
  const [selectedBillingCodes, setSelectedBillingCodes] = useState<BillingCode[]>(() => {
    // If we have encounter data with billing codes, it's an existing record from Dashboard
    if (initialEncounterData?.billingCodes && initialEncounterData.billingCodes.length > 0) {
      return initialEncounterData.billingCodes.map(code => ({
        ...code,
        category: BILLING_CATEGORIES.CONSULTATION,
        timeBasedModifiers: false,
        commonDiagnoses: [],
        relatedCodes: [],
        timeEstimate: 0,
        complexity: 'low' as const
      }));
    }
    
    // For new imports, convert AI suggestions to billing codes
    if (billingCodeSuggestions && billingCodeSuggestions.length > 0) {
      return billingCodeSuggestions.map(suggestion => ({
        code: suggestion.code.code,
        description: suggestion.code.description,
        basePrice: suggestion.code.fee,
        category: BILLING_CATEGORIES.CONSULTATION,
        timeBasedModifiers: false,
        commonDiagnoses: [],
        relatedCodes: [],
        timeEstimate: 0,
        complexity: 'low' as const
      }));
    }

    return [];
  });

  // Store AI suggestions separately only for new imports
  const [aiSuggestions, setAiSuggestions] = useState<BillingCodeSuggestion[]>(() => {
    // Only show AI suggestions if this is a new import (no existing billing codes)
    if (!initialEncounterData?.billingCodes || initialEncounterData.billingCodes.length === 0) {
      return billingCodeSuggestions || [];
    }
    return [];
  });

  // Update state when route params change
  useEffect(() => {
    if (initialPatientData) {
      // Parse date of birth carefully
      let parsedDateOfBirth = new Date();
      if (initialPatientData.dateOfBirth) {
        const dob = new Date(initialPatientData.dateOfBirth);
        if (!isNaN(dob.getTime())) {
          parsedDateOfBirth = dob;
        } else {
          console.warn('Invalid date of birth:', initialPatientData.dateOfBirth);
        }
      }

      setPatientData({
        fullName: initialPatientData.fullName || '',
        firstName: initialPatientData.firstName || '',
        lastName: initialPatientData.lastName || '',
        dateOfBirth: parsedDateOfBirth,
        healthcareNumber: initialPatientData.healthcareNumber || '',
        gender: initialPatientData.gender || '',
        address: initialPatientData.address || '',
        phoneNumber: initialPatientData.phoneNumber || '',
        email: initialPatientData.email || ''
      });
    }

    if (initialEncounterData) {
      setEncounterData({
        date: initialEncounterData.date 
          ? new Date(initialEncounterData.date)
          : new Date(),
        reason: initialEncounterData.reason || '',
        diagnosis: initialEncounterData.diagnosis || [],
        procedures: initialEncounterData.procedures || [],
        notes: initialEncounterData.notes || '',
        provider: initialEncounterData.provider || '',
        location: initialEncounterData.location || '',
        billingCodes: initialEncounterData.billingCodes || [],
        totalAmount: initialEncounterData.totalAmount || 0,
        status: initialEncounterData.status || 'pending'
      });

      // Update billing codes only if it's an existing record
      if (initialEncounterData.billingCodes && initialEncounterData.billingCodes.length > 0) {
        setSelectedBillingCodes(
          initialEncounterData.billingCodes.map(code => ({
            ...code,
            category: BILLING_CATEGORIES.CONSULTATION,
            timeBasedModifiers: false,
            commonDiagnoses: [],
            relatedCodes: [],
            timeEstimate: 0,
            complexity: 'low' as const
          }))
        );
        // Clear AI suggestions for existing records
        setAiSuggestions([]);
      } else if (billingCodeSuggestions) {
        // For new imports, update AI suggestions
        setAiSuggestions(billingCodeSuggestions);
      }
    }
  }, [initialPatientData, initialEncounterData, billingCodeSuggestions]);

  const formatDate = (date: Date | string | undefined): string => {
    try {
      if (!date) return new Date().toLocaleDateString();
      if (date instanceof Date) return date.toLocaleDateString();
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date:', date);
        return new Date().toLocaleDateString();
      }
      return parsedDate.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toLocaleDateString();
    }
  };

  const formatDateToISO = (date: Date | string | undefined): string => {
    try {
      if (!date) return new Date().toISOString().split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date:', date);
        return new Date().toISOString().split('T')[0];
      }
      return parsedDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date to ISO:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  const handleSave = () => {
    // Convert billing codes to the correct format
    const formattedBillingCodes = selectedBillingCodes.map(code => ({
      code: code.code,
      description: code.description,
      basePrice: code.basePrice,
      category: code.category,
      timeBasedModifiers: code.timeBasedModifiers,
      commonDiagnoses: code.commonDiagnoses,
      relatedCodes: code.relatedCodes,
      timeEstimate: code.timeEstimate,
      complexity: code.complexity,
      modifier: code.modifier,
      modifiedPrice: code.modifiedPrice
    }));

    // Calculate total amount
    const totalAmount = formattedBillingCodes.reduce(
      (total, code) => total + (code.modifiedPrice || code.basePrice),
      0
    );

    // Create the updated encounter with serializable dates
    const updatedEncounter: EncounterData = {
      date: encounterData.date instanceof Date ? encounterData.date.toISOString() : encounterData.date,
      reason: encounterData.reason,
      diagnosis: encounterData.diagnosis,
      procedures: encounterData.procedures,
      notes: encounterData.notes,
      provider: encounterData.provider,
      location: encounterData.location,
      billingCodes: formattedBillingCodes,
      totalAmount,
      status: 'pending'
    };

    // Create the updated patient data with serializable dates
    const updatedPatient: PatientData = {
      fullName: patientData.fullName || `${patientData.firstName} ${patientData.lastName}`.trim(),
      firstName: patientData.firstName || patientData.fullName?.split(' ')[0] || '',
      lastName: patientData.lastName || patientData.fullName?.split(' ').slice(1).join(' ') || '',
      dateOfBirth: patientData.dateOfBirth instanceof Date ? patientData.dateOfBirth.toISOString() : patientData.dateOfBirth,
      healthcareNumber: patientData.healthcareNumber,
      gender: patientData.gender,
      address: patientData.address,
      phoneNumber: patientData.phoneNumber,
      email: patientData.email
    };

    // In a real app, this would make an API call to save the data
    Alert.alert(
      'Success',
      'Encounter saved successfully',
      [
        { 
          text: 'OK', 
          onPress: () => {
            setIsEditing(false);
            navigation.navigate('Dashboard', {
              savedEncounter: updatedEncounter,
              savedPatient: updatedPatient
            });
          }
        }
      ]
    );
  };

  const handleBillingCodeSelect = (code: BillingCode) => {
    setSelectedBillingCodes([...selectedBillingCodes, code]);
    setIsBillingModalVisible(false);
  };

  const handleRemoveBillingCode = (index: number) => {
    const newCodes = [...selectedBillingCodes];
    newCodes.splice(index, 1);
    setSelectedBillingCodes(newCodes);
  };

  const renderBillingCodes = () => (
    <View style={[styles.section, { marginBottom: 20 * scale }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontSize: 18 * scale }]}>Billing Codes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            console.log('Opening billing code selector modal');
            setIsBillingModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>Add Code</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Codes Section */}
      {selectedBillingCodes.map((code, index) => (
        <View key={index} style={styles.billingCode}>
          <View style={styles.billingCodeHeader}>
            <Text style={styles.billingCodeTitle}>{code.code}</Text>
            <TouchableOpacity onPress={() => handleRemoveBillingCode(index)}>
              <Text style={styles.removeButton}>Remove</Text>
                    </TouchableOpacity>
                  </View>
          <Text style={styles.billingCodeDescription}>{code.description}</Text>
          <View style={styles.billingCodeDetails}>
            <Text style={styles.billingCodeFee}>
              Base Fee: ${code.basePrice.toFixed(2)}
            </Text>
            {code.modifier && (
              <Text style={styles.billingCodeModifier}>
                Modifier: {code.modifier} (${code.modifiedPrice?.toFixed(2)})
              </Text>
            )}
                  </View>
                </View>
      ))}
      <View style={styles.totalAmount}>
        <Text style={styles.totalAmountText}>
          Total Amount: ${selectedBillingCodes.reduce((total, code) => total + (code.modifiedPrice || code.basePrice), 0).toFixed(2)}
        </Text>
                  </View>
                </View>
  );

  const renderPatientInfo = () => (
    <View style={[styles.section, { marginBottom: 20 * scale }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontSize: 18 * scale }]}>Patient Information</Text>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.infoGrid, { gap: 16 * scale }]}>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Full Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={patientData.fullName}
              onChangeText={(text) => setPatientData(prev => ({ ...prev, fullName: text }))}
              placeholder="Enter full name"
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{patientData.fullName}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Date of Birth</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formatDateToISO(patientData.dateOfBirth)}
              onChangeText={(text) => {
                try {
                  const newDate = new Date(text);
                  if (!isNaN(newDate.getTime())) {
                    setPatientData(prev => ({ ...prev, dateOfBirth: newDate }));
                  }
                } catch (error) {
                  console.error('Invalid date format:', error);
                }
              }}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>
              {formatDate(patientData.dateOfBirth)}
            </Text>
          )}
        </View>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Healthcare Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={patientData.healthcareNumber}
              onChangeText={(text) => setPatientData({ ...patientData, healthcareNumber: text })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{patientData.healthcareNumber}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Gender</Text>
          {isEditing ? (
                    <TextInput
              style={styles.input}
              value={patientData.gender}
              onChangeText={(text) => setPatientData({ ...patientData, gender: text })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{patientData.gender}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={patientData.phoneNumber}
              onChangeText={(text) => setPatientData({ ...patientData, phoneNumber: text })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{patientData.phoneNumber}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Email</Text>
          {isEditing ? (
                    <TextInput
              style={styles.input}
              value={patientData.email}
              onChangeText={(text) => setPatientData({ ...patientData, email: text })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{patientData.email}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { width: '100%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Address</Text>
          {isEditing ? (
                    <TextInput
              style={styles.input}
              value={patientData.address}
              onChangeText={(text) => setPatientData({ ...patientData, address: text })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{patientData.address}</Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderEncounterInfo = () => (
    <View style={[styles.section, { marginBottom: 20 * scale }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontSize: 18 * scale }]}>Encounter Information</Text>
      </View>
      <View style={[styles.infoGrid, { gap: 16 * scale }]}>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Date</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formatDateToISO(encounterData.date)}
              onChangeText={(text) => {
                try {
                  const newDate = new Date(text);
                  if (!isNaN(newDate.getTime())) {
                    setEncounterData(prev => ({ ...prev, date: newDate }));
                  }
                } catch (error) {
                  console.error('Invalid date format:', error);
                }
              }}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>
              {formatDate(encounterData.date)}
            </Text>
          )}
        </View>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Reason</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={encounterData.reason}
              onChangeText={(text) => setEncounterData({ ...encounterData, reason: text })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{encounterData.reason}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Provider</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={encounterData.provider}
              onChangeText={(text) => setEncounterData({ ...encounterData, provider: text })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{encounterData.provider}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { minWidth: '45%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Location</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={encounterData.location}
              onChangeText={(text) => setEncounterData({ ...encounterData, location: text })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{encounterData.location}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { width: '100%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Diagnosis</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={encounterData.diagnosis.join(', ')}
              onChangeText={(text) => setEncounterData({ ...encounterData, diagnosis: text.split(',').map(d => d.trim()) })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{encounterData.diagnosis.join(', ')}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { width: '100%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Procedures</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={encounterData.procedures.join(', ')}
              onChangeText={(text) => setEncounterData({ ...encounterData, procedures: text.split(',').map(p => p.trim()) })}
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{encounterData.procedures.join(', ')}</Text>
          )}
        </View>
        <View style={[styles.infoItem, { width: '100%' }]}>
          <Text style={[styles.label, { fontSize: 14 * scale }]}>Notes</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={encounterData.notes}
              onChangeText={(text) => setEncounterData({ ...encounterData, notes: text })}
              multiline
            />
          ) : (
            <Text style={[styles.value, { fontSize: 16 * scale }]}>{encounterData.notes}</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a237e', '#0d47a1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard', {})} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Data Review</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {renderPatientInfo()}
        {renderEncounterInfo()}
        {renderBillingCodes()}

        {imageUri && (
          <View style={[styles.imageContainer, { marginBottom: 24 * scale }]}>
            <View style={styles.imageHeader}>
              <Text style={styles.imageTitle}>Original Document</Text>
              <TouchableOpacity 
                onPress={() => setIsImageModalVisible(true)}
                style={styles.viewFullButton}
              >
                <Text style={styles.viewFullButtonText}>View Full Size</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: imageUri }}
              style={[styles.image, { width: width - 32 * scale }]}
              resizeMode="contain"
            />
          </View>
        )}
      </ScrollView>

      <BillingCodeSelector
        visible={isBillingModalVisible}
        onClose={() => setIsBillingModalVisible(false)}
        onSelect={handleBillingCodeSelect}
        currentDiagnosis={encounterData.diagnosis}
        currentCodes={selectedBillingCodes}
      />

      {/* Full Size Image Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Original Document</Text>
              <TouchableOpacity 
                onPress={() => setIsImageModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalImageContainer}
              maximumZoomScale={3}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    height: 200,
    borderRadius: 8,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  modalScrollView: {
    flex: 1,
    width: '100%',
  },
  modalImageContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
  },
  viewFullButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewFullButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  billingCode: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  billingCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  billingCodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  removeButton: {
    color: '#f44336',
    fontSize: 14,
  },
  billingCodeDescription: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  billingCodeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingCodeFee: {
    fontSize: 14,
    color: '#666',
  },
  billingCodeModifier: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'right',
  },
  confidenceScore: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  reasoningNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default DataReview;
