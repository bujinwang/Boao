import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SettingItemProps {
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  icon,
  onPress,
  rightElement,
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingItemLeft}>
      <Ionicons name={icon} size={24} color="#333" style={styles.icon} />
      <View>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
    </View>
    {rightElement || <Ionicons name="chevron-forward" size={24} color="#666" />}
  </TouchableOpacity>
);

const SettingsScreen: React.FC = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem
          title="Notifications"
          description="Receive notifications about your records"
          icon="notifications-outline"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
            />
          }
        />
        <SettingItem
          title="Dark Mode"
          description="Toggle dark mode theme"
          icon="moon-outline"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
            />
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          title="Profile"
          description="Manage your account information"
          icon="person-outline"
        />
        <SettingItem
          title="Security"
          description="Change password and security settings"
          icon="shield-checkmark-outline"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem
          title="Help Center"
          description="Get help and contact support"
          icon="help-circle-outline"
        />
        <SettingItem
          title="About"
          description="App version and information"
          icon="information-circle-outline"
        />
      </View>
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
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default SettingsScreen; 