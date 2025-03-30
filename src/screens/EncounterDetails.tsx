import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  useWindowDimensions,
  SafeAreaView
} from 'react-native';
import { PatientData } from '../extraction/models/PatientData';
import { EncounterData } from '../extraction/models/EncounterData';
import { RootStackParamList } from '../types/navigation';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';

type EncounterDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'EncounterDetails'>;
type EncounterDetailsRouteProp = RouteProp<RootStackParamList, 'EncounterDetails'>;

interface EncounterDetailsProps {
  navigation: EncounterDetailsNavigationProp;
  route: EncounterDetailsRouteProp;
}

const EncounterDetails: React.FC<EncounterDetailsProps> = ({ navigation, route }) => {
  const { encounterId } = route.params;
  const { width } = useWindowDimensions(); // Get screen width
  const scale = width < 375 ? 0.9 : width < 428 ? 1 : 1.1; // Define scale factor

  // Mock data - in a real app, this would be fetched from an API
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    dateOfBirth: new Date('1980-01-15'),
    gender: 'Male',
    healthcareNumber: '1234-5678-9012-3456',
    address: '123 Main St, Edmonton, AB T5J 2N9',
    phoneNumber: '(780) 555-0123',
    email: 'john.doe@email.com'
  });

  const [encounterData, setEncounterData] = useState<EncounterData>({
    date: new Date(),
    reason: 'Annual physical examination',
    diagnosis: ['Hypertension', 'Type 2 Diabetes'],
    procedures: ['Comprehensive assessment'],
    notes: 'Patient reported feeling well overall. Blood pressure slightly elevated.',
    provider: 'Dr. Smith',
    location: 'Main Clinic',
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
    totalAmount: 181.50,
    status: 'pending'
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Convert billing codes to the correct format
    const formattedBillingCodes = encounterData.billingCodes.map(code => ({
      code: code.code,
      description: code.description,
      basePrice: code.basePrice,
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
      date: encounterData.date instanceof Date ? encounterData.date.toISOString() : new Date(encounterData.date).toISOString(),
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
      dateOfBirth: patientData.dateOfBirth instanceof Date ? patientData.dateOfBirth.toISOString() : patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toISOString() : undefined,
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
            // Navigate back to Dashboard with the updated data
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Dashboard' as const,
                    params: {
                      savedEncounter: updatedEncounter,
                      savedPatient: updatedPatient
                    }
                  }
                ]
              })
            );
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this encounter?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would make an API call to delete the encounter
            navigation.navigate('Dashboard');
          }
        },
      ]
    );
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const handleDateChange = (date: string) => {
    try {
      const newDate = new Date(date);
      if (!isNaN(newDate.getTime())) {
        setEncounterData(prev => ({ ...prev, date: newDate }));
      }
    } catch (error) {
      console.error('Invalid date format:', error);
    }
  };

  const handlePatientDateOfBirthChange = (date: string) => {
    try {
      const newDate = new Date(date);
      if (!isNaN(newDate.getTime())) {
        setPatientData(prev => ({ ...prev, dateOfBirth: newDate }));
      }
    } catch (error) {
      console.error('Invalid date format:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a237e', '#0d47a1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Encounter Details</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Patient Information Section */}
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
                  value={formatDate(patientData.dateOfBirth)}
                  onChangeText={handlePatientDateOfBirthChange}
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
                  onChangeText={(text) => setPatientData(prev => ({ ...prev, healthcareNumber: text }))}
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
                  onChangeText={(text) => setPatientData(prev => ({ ...prev, gender: text }))}
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
                  onChangeText={(text) => setPatientData(prev => ({ ...prev, phoneNumber: text }))}
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
                  onChangeText={(text) => setPatientData(prev => ({ ...prev, email: text }))}
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
                  onChangeText={(text) => setPatientData(prev => ({ ...prev, address: text }))}
                />
              ) : (
                <Text style={[styles.value, { fontSize: 16 * scale }]}>{patientData.address}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Encounter Information Section */}
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
                  value={formatDate(encounterData.date)}
                  onChangeText={handleDateChange}
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
                  onChangeText={(text) => setEncounterData(prev => ({ ...prev, reason: text }))}
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
                  onChangeText={(text) => setEncounterData(prev => ({ ...prev, provider: text }))}
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
                  onChangeText={(text) => setEncounterData(prev => ({ ...prev, location: text }))}
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
                  onChangeText={(text) => setEncounterData(prev => ({ ...prev, diagnosis: text.split(',').map(d => d.trim()) }))}
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
                  onChangeText={(text) => setEncounterData(prev => ({ ...prev, procedures: text.split(',').map(p => p.trim()) }))}
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
                  onChangeText={(text) => setEncounterData(prev => ({ ...prev, notes: text }))}
                  multiline
                />
              ) : (
                <Text style={[styles.value, { fontSize: 16 * scale }]}>{encounterData.notes}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Billing Codes Section */}
        <View style={[styles.section, { marginBottom: 20 * scale }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { fontSize: 18 * scale }]}>Billing Codes</Text>
          </View>
          {encounterData.billingCodes.map((code, index) => (
            <View key={index} style={styles.billingCode}>
              <View style={styles.billingCodeHeader}>
                <Text style={styles.billingCodeTitle}>{code.code}</Text>
                <Text style={styles.billingCodeDescription}>{code.description}</Text>
              </View>
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
              Total Amount: ${encounterData.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
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
  billingCode: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  billingCodeHeader: {
    marginBottom: 4,
  },
  billingCodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  billingCodeDescription: {
    fontSize: 14,
    color: '#000',
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
});

export default EncounterDetails;
