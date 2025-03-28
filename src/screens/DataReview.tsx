import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, useWindowDimensions } from 'react-native';
import { PatientData } from '../../extraction/models/PatientData';
import { EncounterData } from '../../extraction/models/EncounterData';
import BillingCodeSelector from '../components/BillingCodeSelector';
import { BillingCode } from '../../extraction/models/BillingCodes';

interface DataReviewProps {
  navigation: any;
  route?: any;
  patientData?: PatientData;
  encounterData?: EncounterData;
  originalImage?: string;
  imageUri?: string;
  batchImages?: Array<{
    base64: string;
    uri: string;
  }>;
  currentBatchIndex?: number;
}

type ModifierType = {
  name: string;
  multiplier: number;
};

type ModifiersType = {
  [key: string]: ModifierType;
};

const MODIFIERS: ModifiersType = {
  'CMGP': { name: 'Comprehensive General Practice', multiplier: 1.20 },
  'CALL': { name: 'After Hours Call', multiplier: 1.25 },
  'COMP': { name: 'Complex Care', multiplier: 1.35 },
  'URGN': { name: 'Urgent Care', multiplier: 1.30 },
};

const TABLET_BREAKPOINT = 768; // Width threshold for tablet/desktop layout

const DataReview: React.FC<DataReviewProps> = ({
  navigation,
  route,
  patientData: initialPatientData = {
    fullName: 'John Doe',
    dateOfBirth: new Date('1980-01-15'),
    gender: 'Male',
    healthcareNumber: '123456789',
  },
  encounterData: initialEncounterData = {
    date: new Date('2023-06-10'),
    reason: 'Annual physical examination',
    diagnosis: ['Hypertension', 'Type 2 Diabetes'],
    procedures: ['Comprehensive assessment'],
    billingCodes: [
      {
        code: 'E11.9',
        description: 'Type 2 diabetes without complications',
        basePrice: 85.50,
        modifier: 'CMGP',
        modifiedPrice: 102.60
      }
    ],
    totalAmount: 102.60,
    status: 'pending'
  },
  originalImage: initialOriginalImage,
  imageUri: initialImageUri,
  batchImages,
  currentBatchIndex = 0,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const [editedPatientData, setEditedPatientData] = useState<PatientData>(initialPatientData);
  const [editedEncounterData, setEncounterData] = useState<EncounterData>(initialEncounterData);
  const [localImage] = useState<string | null>(initialImageUri || initialOriginalImage || null);
  const [showBillingSelector, setShowBillingSelector] = useState(false);
  const [selectedBillingCodes, setSelectedBillingCodes] = useState<BillingCode[]>(
    (initialEncounterData.billingCodes || []).map(code => ({
      ...code,
      category: 'GENERAL',
      timeEstimate: 15,
      complexity: 'medium' as const,
      commonDiagnoses: [],
      relatedCodes: [],
    }))
  );

  const handlePatientDataChange = (field: keyof PatientData, value: any) => {
    setEditedPatientData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEncounterDataChange = (field: keyof EncounterData, value: any) => {
    setEncounterData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateModifiedPrice = (basePrice: number, modifier?: string) => {
    if (!modifier || !MODIFIERS[modifier]) return basePrice;
    return basePrice * MODIFIERS[modifier].multiplier;
  };

  const handleAddBillingCode = () => {
    setShowBillingSelector(true);
  };

  const handleBillingCodeSelect = (code: BillingCode) => {
    const newBillingCodes = [...selectedBillingCodes, code];
    setSelectedBillingCodes(newBillingCodes);
    
    const totalAmount = newBillingCodes.reduce(
      (sum, code) => sum + (code.modifiedPrice || code.basePrice),
      0
    );

    const simpleBillingCodes = newBillingCodes.map(({ code, description, basePrice, modifier, modifiedPrice, timeBasedModifiers }) => ({
      code,
      description,
      basePrice,
      modifier,
      modifiedPrice,
      timeBasedModifiers,
    }));

    const updatedEncounterData: EncounterData = {
      ...initialEncounterData,
      billingCodes: simpleBillingCodes,
      totalAmount,
    };
    setEncounterData(updatedEncounterData);
  };

  const handleRemoveBillingCode = (codeToRemove: string) => {
    const newBillingCodes = selectedBillingCodes.filter(
      code => code.code !== codeToRemove
    );
    setSelectedBillingCodes(newBillingCodes);

    const totalAmount = newBillingCodes.reduce(
      (sum, code) => sum + (code.modifiedPrice || code.basePrice),
      0
    );

    const simpleBillingCodes = newBillingCodes.map(({ code, description, basePrice, modifier, modifiedPrice, timeBasedModifiers }) => ({
      code,
      description,
      basePrice,
      modifier,
      modifiedPrice,
      timeBasedModifiers,
    }));

    const updatedEncounterData: EncounterData = {
      ...initialEncounterData,
      billingCodes: simpleBillingCodes,
      totalAmount,
    };
    setEncounterData(updatedEncounterData);
  };

  const handleSave = () => {
    // Save data and return to dashboard
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  const handleCancel = () => {
    // Navigate to dashboard without saving
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleNextImage = () => {
    if (batchImages && currentBatchIndex < batchImages.length - 1) {
      navigation.replace('DataReview', {
        originalImage: batchImages[currentBatchIndex + 1].base64,
        imageUri: batchImages[currentBatchIndex + 1].uri,
        batchImages,
        currentBatchIndex: currentBatchIndex + 1,
      });
    }
  };

  const handlePreviousImage = () => {
    if (batchImages && currentBatchIndex > 0) {
      navigation.replace('DataReview', {
        originalImage: batchImages[currentBatchIndex - 1].base64,
        imageUri: batchImages[currentBatchIndex - 1].uri,
        batchImages,
        currentBatchIndex: currentBatchIndex - 1,
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Extracted Data</Text>
        <Text style={styles.subtitle}>Verify and correct information if needed</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Form Section */}
        <View style={styles.dataContainer}>
          <ScrollView>
            {/* Patient Information Section */}
            <Text style={styles.sectionTitle}>Patient Information</Text>
            
            <View style={styles.twoColumnLayout}>
              <View style={styles.column}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Patient Name</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={editedPatientData.fullName}
                      onChangeText={(value) => handlePatientDataChange('fullName', value)}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                      <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Date of Birth</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={formatDate(editedPatientData.dateOfBirth)}
                      onChangeText={(value) => {
                        handlePatientDataChange('dateOfBirth', new Date(value));
                      }}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                      <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.column}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Gender</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={editedPatientData.gender}
                      onChangeText={(value) => handlePatientDataChange('gender', value)}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                      <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Healthcare Number</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={editedPatientData.healthcareNumber}
                      onChangeText={(value) => handlePatientDataChange('healthcareNumber', value)}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                      <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Encounter Information Section */}
            <Text style={styles.sectionTitle}>Encounter Information</Text>
            
            <View style={styles.twoColumnLayout}>
              <View style={styles.column}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Visit Date</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={formatDate(editedEncounterData.date)}
                      onChangeText={(value) => {
                        handleEncounterDataChange('date', new Date(value));
                      }}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                      <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Reason for Visit</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={editedEncounterData.reason}
                      onChangeText={(value) => handleEncounterDataChange('reason', value)}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                      <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.column}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Diagnosis</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={editedEncounterData.diagnosis?.join(', ')}
                      onChangeText={(value) => handleEncounterDataChange('diagnosis', value.split(', '))}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                      <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Procedures</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={editedEncounterData.procedures?.join(', ')}
                      onChangeText={(value) => handleEncounterDataChange('procedures', value.split(', '))}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                      <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Billing Codes Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Billing Codes</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddBillingCode}
                >
                  <Text style={styles.addButtonText}>+ Add Code</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.billingCodesGrid}>
                {selectedBillingCodes.map((code) => (
                  <View key={code.code} style={styles.billingCodeItem}>
                    <View style={styles.billingCodeHeader}>
                      <Text style={styles.billingCode}>{code.code}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveBillingCode(code.code)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.billingDescription}>{code.description}</Text>
                    <View style={styles.billingDetails}>
                      <Text style={styles.basePrice}>
                        Base: ${code.basePrice.toFixed(2)}
                      </Text>
                      {code.modifier && (
                        <Text style={styles.modifier}>
                          Modifier: {code.modifier}
                        </Text>
                      )}
                      <Text style={styles.modifiedPrice}>
                        Final: ${(code.modifiedPrice || code.basePrice).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {selectedBillingCodes.length > 0 && (
                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalAmount}>
                    ${editedEncounterData.totalAmount?.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save & Continue</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Original Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Original Image</Text>
          <View style={styles.imageContainer}>
            {localImage ? (
              <Image 
                source={{ uri: `data:image/jpeg;base64,${localImage}` }} 
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No image available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Batch Navigation */}
        {batchImages && (
          <View style={styles.batchNavigation}>
            <TouchableOpacity 
              style={[styles.batchNavButton, currentBatchIndex === 0 && styles.batchNavButtonDisabled]}
              onPress={handlePreviousImage}
              disabled={currentBatchIndex === 0}
            >
              <Text style={[styles.batchNavButtonText, currentBatchIndex === 0 && styles.batchNavButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.batchCounter}>
              Image {currentBatchIndex + 1} of {batchImages.length}
            </Text>
            
            <TouchableOpacity 
              style={[styles.batchNavButton, currentBatchIndex === batchImages.length - 1 && styles.batchNavButtonDisabled]}
              onPress={handleNextImage}
              disabled={currentBatchIndex === batchImages.length - 1}
            >
              <Text style={[styles.batchNavButtonText, currentBatchIndex === batchImages.length - 1 && styles.batchNavButtonTextDisabled]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <BillingCodeSelector
        visible={showBillingSelector}
        onClose={() => setShowBillingSelector(false)}
        onSelect={handleBillingCodeSelect}
        currentDiagnosis={initialEncounterData.diagnosis}
        currentCodes={selectedBillingCodes}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  dataContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginBottom: 20,
  },
  imageSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999999',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1976D2',
    marginTop: 15,
    marginBottom: 15,
  },
  formField: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 8,
  },
  editIcon: {
    padding: 5,
  },
  editIconText: {
    fontSize: 18,
    color: '#1976D2',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#1976D2',
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  addButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  billingCodeItem: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  billingCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billingCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  billingDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#F44336',
  },
  billingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  basePrice: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
  },
  modifier: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
  },
  modifiedPrice: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'right',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginRight: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  twoColumnLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  billingCodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  batchNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  batchNavButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4285F4',
    borderRadius: 4,
  },
  batchNavButtonDisabled: {
    backgroundColor: '#E8EAED',
  },
  batchNavButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  batchNavButtonTextDisabled: {
    color: '#9AA0A6',
  },
  batchCounter: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '500',
  },
});

export default DataReview;
