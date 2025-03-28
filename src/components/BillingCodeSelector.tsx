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
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BillingCode,
  BillingModifier,
  BILLING_CATEGORIES,
  BILLING_MODIFIERS,
  suggestCodesForDiagnosis,
  suggestRelatedCodes,
  getApplicableModifiers,
  calculateTimeModifier
} from '../extraction/models/BillingCodes';
import { SvgXml } from 'react-native-svg';

// Define SVG icons inline since the icons.ts file is missing
const allIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
</svg>`;

const consultIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 11V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7C4 5.89543 4.89543 5 6 5H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M9 9L7 11L9 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15 9L17 11L15 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 8L12 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const procedureIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
</svg>`;

const diagnosticIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 5.5H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M4 9.5H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M4 13.5H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M4 17.5H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <circle cx="18" cy="16" r="4" stroke="currentColor" stroke-width="2"/>
</svg>`;

const premiumIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3L14.5 8.5L21 9.5L16.5 14L17.5 20.5L12 17.5L6.5 20.5L7.5 14L3 9.5L9.5 8.5L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

const starIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
</svg>`;

const trendingIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15 7H21V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

interface BillingCodeSelectorProps {
  onSelect: (code: BillingCode) => void;
  onClose: () => void;
  visible: boolean;
  currentDiagnosis?: string | string[];
  currentCodes?: BillingCode[];
}

interface CategoryData {
  name: string;
  icon: string;
  personalUsage: number;
  systemUsage: number;
}

const complexityStyles: Record<string, ViewStyle> = {
  low: { backgroundColor: '#E8F5E9' },
  medium: { backgroundColor: '#FFF3E0' },
  high: { backgroundColor: '#FFEBEE' },
};

const categories: CategoryData[] = [
  { name: 'All', icon: allIconSvg, personalUsage: 0, systemUsage: 0 },
  { name: 'Consult', icon: consultIconSvg, personalUsage: 45, systemUsage: 1250 },
  { name: 'Procedure', icon: procedureIconSvg, personalUsage: 32, systemUsage: 890 },
  { name: 'Diagnostic', icon: diagnosticIconSvg, personalUsage: 28, systemUsage: 760 },
  { name: 'Premium', icon: premiumIconSvg, personalUsage: 15, systemUsage: 320 }
];

const COMMON_BILLING_CODES: BillingCode[] = [
  // Consult Category
  {
    code: 'C101',
    description: 'Initial consultation',
    basePrice: 120.00,
    category: 'Consult',
    timeEstimate: 30,
    complexity: 'medium',
    commonDiagnoses: ['New Patient', 'General Assessment'],
    relatedCodes: ['C102', 'C103']
  },
  {
    code: 'C102',
    description: 'Follow-up consultation',
    basePrice: 75.50,
    category: 'Consult',
    timeEstimate: 20,
    complexity: 'low',
    commonDiagnoses: ['Follow-up', 'Medication Review'],
    relatedCodes: ['C101']
  },
  {
    code: 'C103',
    description: 'Complex consultation',
    basePrice: 180.00,
    category: 'Consult',
    timeEstimate: 45,
    complexity: 'high',
    commonDiagnoses: ['Multiple Chronic Conditions', 'Complex Care'],
    relatedCodes: ['C101']
  },

  // Procedure Category
  {
    code: 'P201',
    description: 'Minor surgical procedure',
    basePrice: 150.00,
    category: 'Procedure',
    timeEstimate: 40,
    complexity: 'medium',
    commonDiagnoses: ['Skin Lesion', 'Wound Care'],
    relatedCodes: ['P202']
  },
  {
    code: 'P202',
    description: 'Wound dressing',
    basePrice: 65.00,
    category: 'Procedure',
    timeEstimate: 15,
    complexity: 'low',
    commonDiagnoses: ['Wound Care', 'Post-surgical Care'],
    relatedCodes: ['P201']
  },
  {
    code: 'P203',
    description: 'Complex surgical procedure',
    basePrice: 250.00,
    category: 'Procedure',
    timeEstimate: 60,
    complexity: 'high',
    commonDiagnoses: ['Complex Wound', 'Surgical Intervention'],
    relatedCodes: ['P201', 'P202']
  },

  // Diagnostic Category
  {
    code: 'D301',
    description: 'Basic diagnostic assessment',
    basePrice: 85.00,
    category: 'Diagnostic',
    timeEstimate: 25,
    complexity: 'low',
    commonDiagnoses: ['General Screening', 'Preventive Care'],
    relatedCodes: ['D302']
  },
  {
    code: 'D302',
    description: 'Comprehensive diagnostic workup',
    basePrice: 165.00,
    category: 'Diagnostic',
    timeEstimate: 45,
    complexity: 'medium',
    commonDiagnoses: ['Complex Symptoms', 'Multiple Systems Review'],
    relatedCodes: ['D301', 'D303']
  },
  {
    code: 'D303',
    description: 'Advanced diagnostic evaluation',
    basePrice: 225.00,
    category: 'Diagnostic',
    timeEstimate: 60,
    complexity: 'high',
    commonDiagnoses: ['Rare Conditions', 'Diagnostic Challenges'],
    relatedCodes: ['D302']
  },

  // Premium Category
  {
    code: 'PR401',
    description: 'Premium health assessment',
    basePrice: 300.00,
    category: 'Premium',
    timeEstimate: 90,
    complexity: 'high',
    commonDiagnoses: ['Executive Health', 'Comprehensive Screening'],
    relatedCodes: ['PR402']
  },
  {
    code: 'PR402',
    description: 'Premium follow-up care',
    basePrice: 200.00,
    category: 'Premium',
    timeEstimate: 45,
    complexity: 'medium',
    commonDiagnoses: ['Follow-up Care', 'Health Monitoring'],
    relatedCodes: ['PR401']
  }
];

// Add storage keys as constants
const STORAGE_KEYS = {
  FAVORITES: 'favoriteBillingCodes',
  RECENT: 'recentBillingCodes',
  USAGE_COUNT: 'billingCodeUsageCount'
};

// Sample codes for AI suggestions
const SAMPLE_SUGGESTED_CODES: BillingCode[] = [
  {
    code: 'C103',
    description: 'Complex consultation for chronic conditions',
    basePrice: 180.00,
    category: 'Consult',
    timeEstimate: 45,
    complexity: 'high',
    commonDiagnoses: ['Hypertension', 'Type 2 Diabetes', 'Multiple Chronic Conditions'],
    relatedCodes: ['C101']
  },
  {
    code: 'D302',
    description: 'Comprehensive diagnostic workup for chronic disease management',
    basePrice: 165.00,
    category: 'Diagnostic',
    timeEstimate: 45,
    complexity: 'medium',
    commonDiagnoses: ['Hypertension', 'Type 2 Diabetes', 'Complex Symptoms'],
    relatedCodes: ['D301', 'D303']
  },
  {
    code: 'P201',
    description: 'Minor surgical procedure for diabetic wound care',
    basePrice: 150.00,
    category: 'Procedure',
    timeEstimate: 40,
    complexity: 'medium',
    commonDiagnoses: ['Type 2 Diabetes', 'Wound Care', 'Diabetic Foot'],
    relatedCodes: ['P202']
  }
];

const BillingCodeSelector: React.FC<BillingCodeSelectorProps> = ({
  onSelect,
  onClose,
  visible,
  currentDiagnosis,
  currentCodes
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>([]);
  const [recentCodes, setRecentCodes] = useState<string[]>([]);
  const [usageCount, setUsageCount] = useState<Record<string, number>>({});
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<BillingCode | null>(null);
  const [actualTime, setActualTime] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [complexityFilter, setComplexityFilter] = useState<'low' | 'medium' | 'high' | null>(null);
  const { width } = useWindowDimensions();

  // Load favorites and recent codes from storage
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedFavorites, storedRecent, storedUsage] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.getItem(STORAGE_KEYS.RECENT),
        AsyncStorage.getItem(STORAGE_KEYS.USAGE_COUNT)
      ]);

      if (storedFavorites) setFavoriteCodes(JSON.parse(storedFavorites));
      if (storedRecent) setRecentCodes(JSON.parse(storedRecent));
      if (storedUsage) setUsageCount(JSON.parse(storedUsage));
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const updateRecentCodes = async (code: string) => {
    try {
      const newRecent = [code, ...recentCodes.filter(c => c !== code)].slice(0, 10);
      setRecentCodes(newRecent);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(newRecent));

      // Update usage count
      const newUsageCount = { ...usageCount };
      newUsageCount[code] = (newUsageCount[code] || 0) + 1;
      setUsageCount(newUsageCount);
      await AsyncStorage.setItem(STORAGE_KEYS.USAGE_COUNT, JSON.stringify(newUsageCount));
    } catch (error) {
      console.error('Error updating recent codes:', error);
    }
  };

  const toggleFavorite = async (code: string) => {
    const newFavorites = favoriteCodes.includes(code)
      ? favoriteCodes.filter(c => c !== code)
      : [...favoriteCodes, code];
    
    setFavoriteCodes(newFavorites);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Show suggestions based on current diagnosis
  useEffect(() => {
    if (currentDiagnosis && showSuggestions) {
      const diagnoses = Array.isArray(currentDiagnosis) ? currentDiagnosis : [currentDiagnosis];
      const suggestions = diagnoses.flatMap(diagnosis => suggestCodesForDiagnosis(diagnosis));
      if (suggestions.length > 0) {
        setSearchQuery(''); // Clear any existing search
        setSelectedCategory('All'); // Clear category filter
      }
    }
  }, [currentDiagnosis, showSuggestions]);

  const handleComplexityChange = (complexity: 'low' | 'medium' | 'high' | null) => {
    setComplexityFilter(complexity === complexityFilter ? null : complexity);
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
    if (selectedCategory !== 'All') {
      codes = codes.filter(code => code.category === selectedCategory);
    }

    // Filter by complexity
    if (complexityFilter) {
      codes = codes.filter(code => code.complexity === complexityFilter);
    }

    // Add suggestions based on current diagnosis
    if (currentDiagnosis && showSuggestions) {
      const diagnoses = Array.isArray(currentDiagnosis) ? currentDiagnosis : [currentDiagnosis];
      codes = codes.sort((a, b) => {
        const aHasMatch = a.commonDiagnoses?.some(d => 
          diagnoses.some(diagnosis => d.toLowerCase().includes(diagnosis.toLowerCase()))
        ) ?? false;
        const bHasMatch = b.commonDiagnoses?.some(d => 
          diagnoses.some(diagnosis => d.toLowerCase().includes(diagnosis.toLowerCase()))
        ) ?? false;
        return (bHasMatch ? 1 : 0) - (aHasMatch ? 1 : 0);
      });
    }

    return codes;
  };

  const handleCodeSelect = async (code: BillingCode) => {
    await updateRecentCodes(code.code);
    
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
                <Text style={styles.complexityBadgeText}>{item.complexity}</Text>
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

  const renderCategoryButton = (category: CategoryData) => (
    <TouchableOpacity
      key={category.name}
      style={[
        styles.categoryButton,
        selectedCategory === category.name && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category.name)}
    >
      <View style={styles.categoryContent}>
        <SvgXml 
          xml={category.icon} 
          width={24} 
          height={24} 
          color={selectedCategory === category.name ? '#fff' : '#666'} 
        />
        <Text style={[
          styles.categoryText,
          selectedCategory === category.name && styles.categoryTextActive
        ]}>
          {category.name}
        </Text>
      </View>
      {category.name !== 'All' && (
        <View style={styles.usageStats}>
          <View style={styles.usageStat}>
            <SvgXml xml={starIconSvg} width={12} height={12} color="#FFC107" />
            <Text style={styles.usageText}>{category.personalUsage}</Text>
          </View>
          <View style={styles.usageStat}>
            <SvgXml xml={trendingIconSvg} width={12} height={12} color="#2196F3" />
            <Text style={styles.usageText}>{category.systemUsage}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

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

        {/* Reference Section */}
        <View style={styles.referenceSection}>
          <View style={styles.referenceHeader}>
            <Text style={styles.referenceTitle}>📋 Current Visit Details</Text>
          </View>
          <View style={styles.referenceContent}>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceLabel}>Diagnosis:</Text>
              <Text style={styles.referenceValue}>
                {Array.isArray(currentDiagnosis) 
                  ? currentDiagnosis.join(', ') 
                  : currentDiagnosis || 'Not specified'}
              </Text>
            </View>
            {currentCodes && currentCodes.length > 0 && (
              <View style={styles.referenceItem}>
                <Text style={styles.referenceLabel}>Procedures:</Text>
                <Text style={styles.referenceValue}>
                  {currentCodes.map(code => code.code).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Favorites Section */}
        {favoriteCodes.length > 0 && (
          <View style={styles.favoritesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ My Favorites</Text>
              <Text style={styles.sectionCount}>{favoriteCodes.length} codes</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.favoritesScroll}
            >
              {favoriteCodes
                .map(code => COMMON_BILLING_CODES.find(c => c.code === code))
                .filter((code): code is BillingCode => code !== undefined)
                .map(item => (
                  <View key={item.code} style={styles.favoriteItem}>
                    <TouchableOpacity 
                      style={styles.favoriteCard}
                      onPress={() => handleCodeSelect(item)}
                    >
                      <View style={styles.favoriteHeader}>
                        <Text style={styles.favoriteCode}>{item.code}</Text>
                        {usageCount[item.code] > 0 && (
                          <View style={styles.usageCount}>
                            <Text style={styles.usageCountText}>{usageCount[item.code]}×</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.favoriteDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <Text style={styles.favoritePrice}>${item.basePrice.toFixed(2)}</Text>
                    </TouchableOpacity>
                  </View>
                ))
              }
            </ScrollView>
          </View>
        )}

        {/* AI Suggestions Section */}
        {currentDiagnosis && (
          <View style={styles.suggestionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🤖 AI Suggestions</Text>
              <Text style={styles.sectionCount}>Based on diagnosis</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
            >
              {SAMPLE_SUGGESTED_CODES.map(item => (
                <View key={item.code} style={styles.suggestionItem}>
                  <TouchableOpacity 
                    style={[styles.favoriteCard, styles.suggestionCard]}
                    onPress={() => handleCodeSelect(item)}
                  >
                    <View style={styles.favoriteHeader}>
                      <Text style={styles.favoriteCode}>{item.code}</Text>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(item.code)}
                        style={styles.favoriteButton}
                      >
                        <Text style={styles.favoriteIcon}>
                          {favoriteCodes.includes(item.code) ? '★' : '☆'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.favoriteDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <Text style={styles.favoritePrice}>${item.basePrice.toFixed(2)}</Text>
                    <View style={styles.aiMatchTag}>
                      <Text style={styles.aiMatchText}>AI Match</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Smart Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchHeader}>
            <Text style={styles.sectionTitle}>🔍 Smart Search</Text>
          </View>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by code, description, or keywords..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Main Results Section */}
        <View style={styles.resultsSection}>
          <FlatList
            data={getFilteredCodes()}
            renderItem={({ item }) => {
              const isSuggested = currentDiagnosis && (
                Array.isArray(currentDiagnosis) ? currentDiagnosis : [currentDiagnosis]
              ).some(diagnosis =>
                item.commonDiagnoses?.some(d =>
                  d.toLowerCase().includes(diagnosis.toLowerCase())
                )
              );

              return (
                <TouchableOpacity
                  style={[
                    styles.resultCard,
                    isSuggested && styles.suggestedCard
                  ]}
                  onPress={() => handleCodeSelect(item)}
                >
                  <View style={styles.resultContent}>
                    <View style={styles.resultHeader}>
                      <View style={styles.resultHeaderLeft}>
                        <Text style={styles.resultCode}>{item.code}</Text>
                        <TouchableOpacity
                          onPress={() => toggleFavorite(item.code)}
                          style={styles.favoriteButton}
                        >
                          <Text style={styles.favoriteIcon}>
                            {favoriteCodes.includes(item.code) ? '★' : '☆'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.resultPrice}>${item.basePrice.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.resultDescription}>{item.description}</Text>
                    {isSuggested && (
                      <View style={styles.aiTag}>
                        <Text style={styles.aiTagText}>🤖 AI Suggested for current diagnosis</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={item => item.code}
            contentContainerStyle={styles.resultsList}
          />
        </View>
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
  favoritesSection: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666666',
  },
  favoritesScroll: {
    paddingHorizontal: 15,
  },
  favoriteItem: {
    width: 200,
    marginRight: 10,
  },
  favoriteCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  favoriteDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  favoritePrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  usageCount: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usageCountText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '500',
  },
  searchSection: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInputContainer: {
    paddingHorizontal: 15,
  },
  searchInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  resultsSection: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  resultsList: {
    padding: 15,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  suggestedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultContent: {
    padding: 15,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#FFC107',
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
  resultDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  aiTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  aiTagText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
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
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  usageStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  usageText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  complexityBadgeText: {
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
  quickAccessSection: {
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  quickAccessList: {
    marginTop: 10,
  },
  quickAccessItem: {
    width: 300,
    marginRight: 10,
    position: 'relative',
  },
  usageCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  suggestionsSection: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  suggestionsScroll: {
    paddingHorizontal: 15,
  },
  suggestionItem: {
    width: 200,
    marginRight: 10,
  },
  suggestionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  aiMatchTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiMatchText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  categoryButtonActive: {
    backgroundColor: '#1976D2',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTextActive: {
    color: 'white',
  },
  referenceSection: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  referenceHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  referenceContent: {
    paddingHorizontal: 20,
  },
  referenceItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  referenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    width: 80,
  },
  referenceValue: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
});

export default BillingCodeSelector;
