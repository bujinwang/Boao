import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ScrollView,
  Switch,
  ViewStyle,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  BillingCode, 
  BillingModifier, 
  BILLING_CATEGORIES, 
  BILLING_MODIFIERS, 
  COMMON_BILLING_CODES,
  suggestCodesForDiagnosis,
  suggestRelatedCodes,
  getApplicableModifiers,
  calculateTimeModifier
} from '../../extraction/models/BillingCodes';

interface BillingCodeSelectorProps {
  onSelect: (code: BillingCode) => void;
  onClose: () => void;
  visible: boolean;
  currentDiagnosis?: string | string[];
  currentCodes?: BillingCode[];
}

const complexityStyles: Record<string, ViewStyle> = {
  low: { backgroundColor: '#E8F5E9' },
  medium: { backgroundColor: '#FFF3E0' },
  high: { backgroundColor: '#FFEBEE' },
};

const BillingCodeSelector: React.FC<BillingCodeSelectorProps> = ({
  onSelect,
  onClose,
  visible,
  currentDiagnosis,
  currentCodes
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>([]);
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<BillingCode | null>(null);
  const [actualTime, setActualTime] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [complexityFilter, setComplexityFilter] = useState<'low' | 'medium' | 'high' | null>(null);

  // Load favorite codes from storage
  useEffect(() => {
    loadFavorites();
  }, []);

  // Show suggestions based on current diagnosis
  useEffect(() => {
    if (currentDiagnosis && showSuggestions) {
      const diagnoses = Array.isArray(currentDiagnosis) ? currentDiagnosis : [currentDiagnosis];
      const suggestions = diagnoses.flatMap(diagnosis => suggestCodesForDiagnosis(diagnosis));
      if (suggestions.length > 0) {
        setSearchQuery(''); // Clear any existing search
        setSelectedCategory(null); // Clear category filter
      }
    }
  }, [currentDiagnosis, showSuggestions]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favoriteBillingCodes');
      if (stored) {
        setFavoriteCodes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (code: string) => {
    const newFavorites = favoriteCodes.includes(code)
      ? favoriteCodes.filter(c => c !== code)
      : [...favoriteCodes, code];
    
    setFavoriteCodes(newFavorites);
    try {
      await AsyncStorage.setItem('favoriteBillingCodes', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const getFilteredCodes = () => {
    let codes = [...COMMON_BILLING_CODES];

    // Filter by search query
    if (searchQuery) {
      codes = codes.filter(code => 
        code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.commonDiagnoses?.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory) {
      codes = codes.filter(code => code.category === selectedCategory);
    }

    // Filter by complexity
    if (complexityFilter) {
      codes = codes.filter(code => code.complexity === complexityFilter);
    }

    // Add suggestions based on current diagnosis
    if (currentDiagnosis && showSuggestions) {
      const diagnoses = Array.isArray(currentDiagnosis) ? currentDiagnosis : [currentDiagnosis];
      const suggestions = diagnoses.flatMap(diagnosis => suggestCodesForDiagnosis(diagnosis));
      codes = [...suggestions, ...codes.filter(code => 
        !suggestions.some(s => s.code === code.code)
      )];
    }

    // Add related codes if there are current codes
    if (currentCodes?.length && showSuggestions) {
      const relatedCodes = currentCodes.flatMap(code => 
        suggestRelatedCodes(code.code)
      );
      codes = [...relatedCodes, ...codes.filter(code =>
        !relatedCodes.some(r => r.code === code.code)
      )];
    }

    return codes;
  };

  const handleCodeSelect = (code: BillingCode) => {
    const applicableModifiers = getApplicableModifiers(code);
    if (applicableModifiers.length > 0 || code.timeBasedModifiers) {
      setSelectedCode(code);
      setActualTime(code.timeEstimate || null);
      setShowModifierModal(true);
    } else {
      onSelect(code);
      onClose();
    }
  };

  const handleModifierSelect = (modifier: BillingModifier) => {
    if (selectedCode) {
      let finalMultiplier = modifier.multiplier;

      // Apply time-based calculation if applicable
      if (modifier.timeMultiplier && actualTime && selectedCode.timeEstimate) {
        finalMultiplier = calculateTimeModifier(
          selectedCode.timeEstimate,
          actualTime,
          modifier
        );
      }

      const modifiedCode: BillingCode = {
        ...selectedCode,
        modifier: modifier.code,
        modifiedPrice: selectedCode.basePrice * finalMultiplier
      };
      onSelect(modifiedCode);
      setShowModifierModal(false);
      onClose();
    }
  };

  const renderBillingCode = ({ item }: { item: BillingCode }) => {
    const isFavorite = favoriteCodes.includes(item.code);
    const diagnoses = Array.isArray(currentDiagnosis) ? currentDiagnosis : currentDiagnosis ? [currentDiagnosis] : [];
    const isSuggested = diagnoses.length > 0 && 
      item.commonDiagnoses?.some(d => 
        diagnoses.some(diagnosis => 
          d.toLowerCase().includes(diagnosis.toLowerCase())
        )
      );
    const isRelated = currentCodes?.some(code =>
      code.relatedCodes?.includes(item.code)
    );
    
    return (
      <TouchableOpacity
        style={[
          styles.codeItem,
          isSuggested && styles.suggestedItem,
          isRelated && styles.relatedItem
        ]}
        onPress={() => handleCodeSelect(item)}
      >
        <View style={styles.codeHeader}>
          <View style={styles.codeHeaderLeft}>
            <Text style={styles.codeText}>{item.code}</Text>
            {item.complexity && (
              <View style={[
                styles.complexityBadge,
                complexityStyles[item.complexity]
              ]}>
                <Text style={styles.complexityText}>{item.complexity}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.code)}
            style={styles.favoriteButton}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.descriptionText}>{item.description}</Text>
        <View style={styles.codeFooter}>
          <Text style={styles.priceText}>${item.basePrice.toFixed(2)}</Text>
          <Text style={styles.timeText}>{item.timeEstimate}min</Text>
        </View>
        {item.commonDiagnoses && (
          <Text style={styles.diagnosesText}>
            Common: {item.commonDiagnoses.join(', ')}
          </Text>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderModifierOption = (modifier: BillingModifier) => {
    const isApplicable = !modifier.applicableCategories || 
      (selectedCode && modifier.applicableCategories.includes(selectedCode.category));

    if (!isApplicable) return null;

    let finalPrice = selectedCode?.basePrice || 0;
    if (modifier.timeMultiplier && actualTime && selectedCode?.timeEstimate) {
      const finalMultiplier = calculateTimeModifier(
        selectedCode.timeEstimate,
        actualTime,
        modifier
      );
      finalPrice *= finalMultiplier;
    } else {
      finalPrice *= modifier.multiplier;
    }

    return (
      <TouchableOpacity
        key={modifier.code}
        style={[styles.modifierItem, !isApplicable && styles.modifierDisabled]}
        onPress={() => handleModifierSelect(modifier)}
        disabled={!isApplicable}
      >
        <View style={styles.modifierHeader}>
          <View>
            <Text style={styles.modifierName}>{modifier.name}</Text>
            {modifier.requiresDocumentation && (
              <Text style={styles.documentationRequired}>* Documentation Required</Text>
            )}
          </View>
          <Text style={styles.modifierMultiplier}>×{modifier.multiplier}</Text>
        </View>
        <Text style={styles.modifierDescription}>{modifier.description}</Text>
        {selectedCode && (
          <View style={styles.modifierPricing}>
            <Text style={styles.basePrice}>
              Base: ${selectedCode.basePrice.toFixed(2)}
            </Text>
            <Text style={styles.modifiedPrice}>
              Final: ${finalPrice.toFixed(2)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Billing Code</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by code, description, or diagnosis..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.searchOptions}>
            <View style={styles.optionItem}>
              <Text style={styles.optionLabel}>Show Suggestions</Text>
              <Switch
                value={showSuggestions}
                onValueChange={setShowSuggestions}
              />
            </View>
            <TouchableOpacity
              style={styles.complexityButton}
              onPress={() => {
                setComplexityFilter(current => {
                  switch (current) {
                    case null: return 'low';
                    case 'low': return 'medium';
                    case 'medium': return 'high';
                    case 'high': return null;
                  }
                });
              }}
            >
              <Text style={styles.complexityButtonText}>
                {complexityFilter ? `Complexity: ${complexityFilter}` : 'Any Complexity'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              !selectedCategory && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryButtonText,
              !selectedCategory && styles.categoryButtonTextActive
            ]}>All</Text>
          </TouchableOpacity>
          {Object.values(BILLING_CATEGORIES).map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {favoriteCodes.length > 0 && (
          <View style={styles.favoritesSection}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <FlatList
              horizontal
              data={COMMON_BILLING_CODES.filter(code => favoriteCodes.includes(code.code))}
              renderItem={renderBillingCode}
              keyExtractor={item => item.code}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        <FlatList
          data={getFilteredCodes()}
          renderItem={renderBillingCode}
          keyExtractor={item => item.code}
          style={styles.codeList}
        />

        <Modal
          visible={showModifierModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowModifierModal(false)}
        >
          <View style={styles.modifierModalContainer}>
            <View style={styles.modifierContent}>
              <View style={styles.modifierHeader}>
                <Text style={styles.modifierTitle}>Select Modifier</Text>
                <TouchableOpacity
                  onPress={() => setShowModifierModal(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {selectedCode?.timeBasedModifiers && (
                <View style={styles.timeInput}>
                  <Text style={styles.timeInputLabel}>
                    Actual Time (minutes) - Standard: {selectedCode.timeEstimate}min
                  </Text>
                  <TextInput
                    style={styles.timeInputField}
                    value={actualTime?.toString()}
                    onChangeText={(value) => setActualTime(parseInt(value) || null)}
                    keyboardType="numeric"
                    placeholder="Enter actual time..."
                  />
                </View>
              )}

              <ScrollView>
                {Object.values(BILLING_MODIFIERS).map(renderModifierOption)}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
  },
  searchInput: {
    margin: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  searchContainer: {
    padding: 10,
  },
  searchOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    marginRight: 10,
    fontSize: 14,
    color: '#666666',
  },
  complexityButton: {
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  complexityButtonText: {
    color: '#1976D2',
    fontSize: 14,
  },
  categoryContainer: {
    padding: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  categoryButtonActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  categoryButtonText: {
    color: '#666666',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  favoritesSection: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 10,
  },
  codeList: {
    flex: 1,
  },
  codeItem: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  codeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1976D2',
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#FFC107',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5,
  },
  priceText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#666666',
  },
  diagnosesText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 5,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976D2',
  },
  modifierModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modifierContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modifierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modifierTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  modifierItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 10,
  },
  modifierDisabled: {
    opacity: 0.5,
  },
  modifierName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  modifierDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  modifierMultiplier: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
  },
  modifiedPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 5,
  },
  suggestedItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  relatedItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  complexityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  complexityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  codeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeInput: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  timeInputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  timeInputField: {
    fontSize: 16,
    padding: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  documentationRequired: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 2,
  },
  modifierPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  basePrice: {
    fontSize: 14,
    color: '#666666',
  },
});

export { BillingCodeSelector }; 