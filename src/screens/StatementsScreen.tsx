import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useWindowDimensions } from 'react-native'; // Import useWindowDimensions
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
    date: new Date(2025, 2, 15),
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
    date: new Date(2025, 2, 14),
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
    date: new Date(2025, 2, 13),
    amount: 350.00,
    status: 'successful',
    billingCodes: [
      { code: 'G89.4', description: 'Chronic pain management', amount: 350.00 }
    ]
  },
  {
    id: '4',
    patientName: 'Emily Wilson',
    date: new Date(2025, 2, 12),
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
    date: new Date(2025, 2, 11),
    amount: 275.50,
    status: 'pending',
    billingCodes: [
      { code: 'K21.9', description: 'GERD assessment', amount: 155.50 },
      { code: 'R10.13', description: 'Epigastric pain', amount: 120.00 }
    ]
  }
];

const StatementsScreen: React.FC = () => {
  const { width } = useWindowDimensions(); // Get screen width
  const scale = width < 375 ? 0.9 : width < 428 ? 1 : 1.1; // Define scale factor

  // Initialize to March 2025 to show mock data
  const [selectedMonth, setSelectedMonth] = React.useState(new Date(2025, 2, 1));
  const [records, setRecords] = React.useState<BillingRecord[]>(mockBillingRecords);
  const [selectedFilter, setSelectedFilter] = React.useState<'all' | 'successful' | 'failed' | 'pending'>('all');

  const currentMonth = format(selectedMonth, 'MMMM yyyy');
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  const filteredRecords = records.filter(record => 
    isSameMonth(record.date, selectedMonth) && 
    (selectedFilter === 'all' || record.status === selectedFilter)
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
      <View style={[styles.recordHeader, { marginBottom: 12 * scale }]}>
        <View>
          <Text style={[styles.patientName, { fontSize: 16 * scale, marginBottom: 4 * scale }]}>{item.patientName}</Text>
          <Text style={[styles.date, { fontSize: 14 * scale }]}>{format(item.date, 'MMM d, yyyy')}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { fontSize: 18 * scale, marginBottom: 4 * scale }]}>${item.amount.toFixed(2)}</Text>
          <View style={[
            styles.statusBadge, { paddingHorizontal: 8 * scale, paddingVertical: 4 * scale, borderRadius: 4 * scale },
            item.status === 'successful' && styles.successBadge,
            item.status === 'failed' && styles.failedBadge,
            item.status === 'pending' && styles.pendingBadge,
          ]}>
            <Text style={[styles.statusText, { fontSize: 12 * scale }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.codesContainer, { paddingTop: 12 * scale }]}>
        {item.billingCodes.map((code, index) => (
          <View key={index} style={[styles.codeItem, { marginBottom: 8 * scale }]}>
            <Text style={[styles.codeText, { fontSize: 14 * scale, width: 80 * scale }]}>{code.code}</Text>
            <Text style={[styles.codeDescription, { fontSize: 14 * scale, marginHorizontal: 8 * scale }]}>{code.description}</Text>
            <Text style={[styles.codeAmount, { fontSize: 14 * scale }]}>${code.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      
      {item.status === 'failed' && (
        <View style={[styles.failureContainer, { marginTop: 12 * scale, padding: 12 * scale, borderRadius: 6 * scale }]}>
          <Text style={[styles.failureReason, { fontSize: 14 * scale, marginBottom: 8 * scale }]}>{item.failureReason}</Text>
          <TouchableOpacity 
            style={[styles.resolutionButton, { paddingHorizontal: 12 * scale, paddingVertical: 6 * scale, borderRadius: 4 * scale }]}
            onPress={() => handleResolutionHelp(item)}
          >
            <Text style={[styles.resolutionButtonText, { fontSize: 12 * scale }]}>View Resolution</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMonthHeader = () => (
    <View style={styles.monthHeader}>
      <TouchableOpacity 
        onPress={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
        style={[styles.monthNavButton, { padding: 8 * scale }]}
      >
        <Ionicons name="chevron-back" size={24 * scale} color="#333" />
      </TouchableOpacity>
      
      <Text style={[styles.monthTitle, { fontSize: 18 * scale }]}>{currentMonth}</Text>
      
      <TouchableOpacity 
        onPress={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
        style={[styles.monthNavButton, { padding: 8 * scale }]}
      >
        <Ionicons name="chevron-forward" size={24 * scale} color="#333" />
      </TouchableOpacity>
    </View>
  );

  const renderSummary = () => {
    // Calculate total counts and amounts for each status
    const totalRecords = records.filter(record => isSameMonth(record.date, selectedMonth));
    const totalAmount = totalRecords.reduce((sum, record) => sum + record.amount, 0);

    const successRecords = records.filter(record => 
      isSameMonth(record.date, selectedMonth) && record.status === 'successful'
    );
    const successAmount = successRecords.reduce((sum, record) => sum + record.amount, 0);
    
    const failedRecords = records.filter(record => 
      isSameMonth(record.date, selectedMonth) && record.status === 'failed'
    );
    const failedAmount = failedRecords.reduce((sum, record) => sum + record.amount, 0);
    
    const pendingRecords = records.filter(record => 
      isSameMonth(record.date, selectedMonth) && record.status === 'pending'
    );
    const pendingAmount = pendingRecords.reduce((sum, record) => sum + record.amount, 0);

    return (
      <View style={styles.statsRow}>
        <TouchableOpacity 
          style={[
            styles.statChip,
            styles.totalChip,
            selectedFilter === 'all' && styles.totalChipActive
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.statLabel, styles.totalLabel]}>Total [{totalRecords.length}]</Text>
          <Text style={[styles.statAmount, styles.totalAmount]}>${totalAmount.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.statChip,
            styles.successChip,
            selectedFilter === 'successful' && styles.successChipActive
          ]}
          onPress={() => setSelectedFilter('successful')}
        >
          <Text style={[styles.statLabel, styles.successLabel]}>Success [{successRecords.length}]</Text>
          <Text style={[styles.statAmount, styles.successAmount]}>${successAmount.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.statChip,
            styles.failedChip,
            selectedFilter === 'failed' && styles.failedChipActive
          ]}
          onPress={() => setSelectedFilter('failed')}
        >
          <Text style={[styles.statLabel, styles.failedLabel]}>Failed [{failedRecords.length}]</Text>
          <Text style={[styles.statAmount, styles.failedAmount]}>${failedAmount.toFixed(2)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.statChip,
            styles.pendingChip,
            selectedFilter === 'pending' && styles.pendingChipActive
          ]}
          onPress={() => setSelectedFilter('pending')}
        >
          <Text style={[styles.statLabel, styles.pendingLabel]}>Pending [{pendingRecords.length}]</Text>
          <Text style={[styles.statAmount, styles.pendingAmount]}>${pendingAmount.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { padding: 16 * scale }]}>
        <Text style={[styles.title, { fontSize: 24 * scale }]}>Billing Statements</Text>
      </View>
      {renderMonthHeader()}
      {renderSummary()}
      <FlatList
        data={filteredRecords}
        renderItem={renderBillingRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, { padding: 16 * scale }]}
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
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    padding: 12,
  },
  statChip: {
    flex: 1,
    minWidth: 70,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  totalChip: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  totalChipActive: {
    backgroundColor: '#E0E7FF',
    borderColor: '#818CF8',
  },
  totalLabel: {
    color: '#4F46E5',
  },
  totalAmount: {
    color: '#4338CA',
  },
  successChip: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  successChipActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#34D399',
  },
  successLabel: {
    color: '#059669',
  },
  successAmount: {
    color: '#047857',
  },
  failedChip: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  failedChipActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  failedLabel: {
    color: '#DC2626',
  },
  failedAmount: {
    color: '#B91C1C',
  },
  pendingChip: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  pendingChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FBBF24',
  },
  pendingLabel: {
    color: '#D97706',
  },
  pendingAmount: {
    color: '#B45309',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  statAmount: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
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
