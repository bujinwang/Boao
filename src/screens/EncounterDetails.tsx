import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  useWindowDimensions // Import useWindowDimensions
} from 'react-native';
import { PatientData } from '../extraction/models/PatientData'; // Corrected path
import { EncounterData } from '../extraction/models/EncounterData'; // Corrected path

interface EncounterDetailsProps {
  navigation: any;
  route: any;
}

const EncounterDetails: React.FC<EncounterDetailsProps> = ({ navigation, route }) => {
  const { encounterId } = route.params;
  const { width } = useWindowDimensions(); // Get screen width
  const scale = width < 375 ? 0.9 : width < 428 ? 1 : 1.1; // Define scale factor

  // Mock data - in a real app, this would be fetched from an API
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({
    fullName: 'John Doe',
    dateOfBirth: new Date('1980-01-15'),
    gender: 'Male',
    healthcareNumber: '123456789',
  });

  const [encounterData, setEncounterData] = useState<EncounterData>({
    date: new Date('2023-10-15'),
    reason: 'Annual physical examination',
    diagnosis: ['Hypertension', 'Type 2 Diabetes'],
    procedures: ['Comprehensive assessment'],
    billingCodes: [{
      code: 'E11.9',
      description: 'Type 2 diabetes without complications',
      basePrice: 85.50,
      modifier: 'CMGP',
      modifiedPrice: 102.60,
      timeBasedModifiers: true
    }],
    status: 'complete',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real app, this would make an API call to update the data
    Alert.alert(
      'Success',
      'Changes saved successfully',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
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

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { padding: 20 * scale }]}>
        <TouchableOpacity 
          style={[styles.backButton, { padding: 5 * scale }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { fontSize: 16 * scale }]}>← Back</Text>
        </TouchableOpacity>
        <View style={[styles.headerButtons, { gap: 10 * scale }]}>
          {isEditing ? (
            <TouchableOpacity style={[styles.saveButton, { paddingVertical: 8 * scale, paddingHorizontal: 16 * scale, borderRadius: 5 * scale }]} onPress={handleSave}>
              <Text style={[styles.saveButtonText, { fontSize: 14 * scale }]}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.editButton, { paddingVertical: 8 * scale, paddingHorizontal: 16 * scale, borderRadius: 5 * scale }]} onPress={handleEdit}>
              <Text style={[styles.editButtonText, { fontSize: 14 * scale }]}>Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.deleteButton, { paddingVertical: 8 * scale, paddingHorizontal: 16 * scale, borderRadius: 5 * scale }]} onPress={handleDelete}>
            <Text style={[styles.deleteButtonText, { fontSize: 14 * scale }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={[styles.content, { padding: 20 * scale }]}>
        {/* Patient Information */}
        <View style={[styles.section, { borderRadius: 12 * scale, padding: 20 * scale, marginBottom: 20 * scale }]}>
          <Text style={[styles.sectionTitle, { fontSize: 18 * scale, marginBottom: 20 * scale }]}>Patient Information</Text>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Name</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={patientData.fullName}
              onChangeText={(text) => setPatientData({ ...patientData, fullName: text })}
              editable={isEditing}
            />
          </View>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Date of Birth</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={formatDate(patientData.dateOfBirth)}
              onChangeText={(text) => {
                const date = new Date(text);
                if (!isNaN(date.getTime())) {
                  setPatientData({ ...patientData, dateOfBirth: date });
                }
              }}
              editable={isEditing}
            />
          </View>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Gender</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={patientData.gender}
              onChangeText={(text) => setPatientData({ ...patientData, gender: text })}
              editable={isEditing}
            />
          </View>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Healthcare Number</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={patientData.healthcareNumber}
              onChangeText={(text) => setPatientData({ ...patientData, healthcareNumber: text })}
              editable={isEditing}
            />
          </View>
        </View>

        {/* Encounter Information */}
        <View style={[styles.section, { borderRadius: 12 * scale, padding: 20 * scale, marginBottom: 20 * scale }]}>
          <Text style={[styles.sectionTitle, { fontSize: 18 * scale, marginBottom: 20 * scale }]}>Encounter Information</Text>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Date</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={formatDate(encounterData.date)}
              onChangeText={(text) => {
                const date = new Date(text);
                if (!isNaN(date.getTime())) {
                  setEncounterData({ ...encounterData, date });
                }
              }}
              editable={isEditing}
            />
          </View>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Reason</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={encounterData.reason}
              onChangeText={(text) => setEncounterData({ ...encounterData, reason: text })}
              editable={isEditing}
              multiline
            />
          </View>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Diagnosis</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={encounterData.diagnosis?.join(', ') || ''}
              onChangeText={(text) => setEncounterData({ 
                ...encounterData, 
                diagnosis: text.split(', ') 
              })}
              editable={isEditing}
              multiline
            />
          </View>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Procedures</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={encounterData.procedures?.join(', ') || ''}
              onChangeText={(text) => setEncounterData({ 
                ...encounterData, 
                procedures: text.split(', ') 
              })}
              editable={isEditing}
              multiline
            />
          </View>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Billing Codes</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={encounterData.billingCodes?.map(bc => bc.code).join(', ') || ''}
              onChangeText={(text) => {
                const codes = text.split(', ').map(code => ({
                  code,
                  description: '',
                  basePrice: 0,
                  timeBasedModifiers: false
                }));
                setEncounterData({ ...encounterData, billingCodes: codes });
              }}
              editable={isEditing}
              multiline
            />
          </View>
          <View style={[styles.field, { marginBottom: 15 * scale }]}>
            <Text style={[styles.fieldLabel, { fontSize: 14 * scale, marginBottom: 5 * scale }]}>Status</Text>
            <TextInput
              style={[styles.fieldValue, { fontSize: 16 * scale, paddingVertical: 8 * scale }, isEditing && [styles.editableField, { borderRadius: 5 * scale, paddingHorizontal: 10 * scale }]]}
              value={encounterData.status || 'pending'}
              onChangeText={(text) => setEncounterData({ 
                ...encounterData, 
                status: text as 'complete' | 'pending' 
              })}
              editable={isEditing}
            />
          </View>
        </View>
      </ScrollView>
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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 20,
  },
  field: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333333',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  editableField: {
    backgroundColor: '#F5F7FA',
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
});

export default EncounterDetails;
