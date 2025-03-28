import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

interface BillingRecord {
  id: string;
  patientName: string;
  date: Date;
  amount: number;
  status: 'successful' | 'failed' | 'pending';
  billingCodes: Array<{
    code: string;
    description: string;
    amount: number;
  }>;
  failureReason?: string;
  aiSuggestion?: string;
  ahcError?: string;
}

const mockBillingRecords: BillingRecord[] = [
  {
    id: '1',
    patientName: 'John Doe',
    date: new Date(2024, 3, 15),
    amount: 245.50,
    status: 'successful',
    billingCodes: [
      { code: 'E11.9', description: 'Type 2 diabetes follow-up', amount: 125.50 },
      { code: 'I10', description: 'Hypertension check', amount: 120.00 }
    ]
  },
  {
    id: '2',
    patientName: 'Sarah Johnson',
    date: new Date(2024, 3, 14),
    amount: 180.75,
    status: 'failed',
    billingCodes: [
      { code: 'J45.909', description: 'Asthma assessment', amount: 180.75 }
    ],
    failureReason: 'Invalid modifier combination',
    aiSuggestion: 'Remove the CMGP modifier as it conflicts with the CALL modifier for this service type.',
    ahcError: 'ERR-456: Multiple conflicting modifiers detected'
  },
  {
    id: '3',
    patientName: 'Michael Smith',
    date: new Date(2024, 3, 13),
    amount: 350.00,
    status: 'successful',
    billingCodes: [
      { code: 'G89.4', description: 'Chronic pain management', amount: 350.00 }
    ]
  },
  {
    id: '4',
    patientName: 'Emily Wilson',
    date: new Date(2024, 3, 12),
    amount: 95.25,
    status: 'failed',
    billingCodes: [
      { code: 'M54.5', description: 'Lower back pain', amount: 95.25 }
    ],
    failureReason: 'Missing required documentation',
    aiSuggestion: 'Attach the patient\'s previous visit records showing chronic condition history.',
    ahcError: 'ERR-789: Documentation requirements not met'
  },
  {
    id: '5',
    patientName: 'Robert Chen',
    date: new Date(2024, 3, 11),
    amount: 275.50,
    status: 'pending',
    billingCodes: [
      { code: 'K21.9', description: 'GERD assessment', amount: 155.50 },
      { code: 'R10.13', description: 'Epigastric pain', amount: 120.00 }
    ]
  }
];

const StatementsScreen: React.FC = () => {
  // Initialize to April 2024 to show mock data by default
  const [selectedMonth, setSelectedMonth] = React.useState(new Date(2024, 3, 1)); 
  const [records, setRecords] = React.useState<BillingRecord[]>(mockBillingRecords);

  const currentMonth = format(selectedMonth, 'MMMM yyyy');
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  const filteredRecords = records.filter(record => 
    isSameMonth(record.date, selectedMonth)
  );

  const totalBilled = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  const successfulBillings = filteredRecords.filter(r => r.status === 'successful');
  const failedBillings = filteredRecords.filter(r => r.status === 'failed');
  const pendingBillings = filteredRecords.filter(r => r.status === 'pending');

  const handleResolutionHelp = (record: BillingRecord) => {
    if (record.aiSuggestion) {
      Alert.alert(
        'Resolution Suggestion',
        `AI Suggestion: ${record.aiSuggestion}\n\nAHC Error: ${record.ahcError}`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderBillingRecord = ({ item }: { item: BillingRecord }) => (
    <TouchableOpacity 
      style={styles.recordItem}
      onPress={() => item.status === 'failed' && handleResolutionHelp(item)}
    >
      <View style={styles.recordHeader}>
        <View>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.date}>{format(item.date, 'MMM d, yyyy')}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'successful' && styles.successBadge,
            item.status === 'failed' && styles.failedBadge,
            item.status === 'pending' && styles.pendingBadge,
          ]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.codesContainer}>
        {item.billingCodes.map((code, index) => (
          <View key={index} style={styles.codeItem}>
            <Text style={styles.codeText}>{code.code}</Text>
            <Text style={styles.codeDescription}>{code.description}</Text>
            <Text style={styles.codeAmount}>${code.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      
      {item.status === 'failed' && (
        <View style={styles.failureContainer}>
          <Text style={styles.failureReason}>{item.failureReason}</Text>
          <TouchableOpacity 
            style={styles.resolutionButton}
            onPress={() => handleResolutionHelp(item)}
          >
            <Text style={styles.resolutionButtonText}>View Resolution</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMonthHeader = () => (
    <View style={styles.monthHeader}>
      <TouchableOpacity 
        onPress={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
        style={styles.monthNavButton}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>
      
      <Text style={styles.monthTitle}>{currentMonth}</Text>
      
      <TouchableOpacity 
        onPress={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
        style={styles.monthNavButton}
      >
        <Ionicons name="chevron-forward" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Total Billed</Text>
        <Text style={styles.summaryAmount}>${totalBilled.toFixed(2)}</Text>
        <Text style={styles.summarySubtext}>{filteredRecords.length} records</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Successful</Text>
        <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>
          {successfulBillings.length}
        </Text>
        <Text style={styles.summarySubtext}>records</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Failed</Text>
        <Text style={[styles.summaryAmount, { color: '#F44336' }]}>
          {failedBillings.length}
        </Text>
        <Text style={styles.summarySubtext}>need attention</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Billing Statements</Text>
      </View>
      {renderMonthHeader()}
      {renderSummary()}
      <FlatList
        data={filteredRecords}
        renderItem={renderBillingRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  monthNavButton: {
    padding: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  summarySubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  successBadge: {
    backgroundColor: '#E8F5E9',
  },
  failedBadge: {
    backgroundColor: '#FFEBEE',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  codesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976D2',
    width: 80,
  },
  codeDescription: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  codeAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  failureContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3F3',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  failureReason: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 8,
  },
  resolutionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  resolutionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StatementsScreen;
