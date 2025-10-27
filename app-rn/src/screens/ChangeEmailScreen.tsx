import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ChangeEmailScreen = ({ navigation }: any) => {
  const { user, refreshUser } = useAuth();
  const [currentEmail, setCurrentEmail] = useState(user?.email || '');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password to confirm');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      Alert.alert('Error', 'New email must be different from current email');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/change-email', {
        newEmail: newEmail.trim().toLowerCase(),
        password: password,
      });

      Alert.alert(
        'Success',
        response.data.message || 'Email updated successfully! Please check your new email for verification.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await refreshUser();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Change email error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to change email. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Change Email</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Update your email address. You'll need to verify your new email before it becomes active.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Current Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={currentEmail}
            editable={false}
          />

          <Text style={styles.label}>New Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new email"
            placeholderTextColor={theme.colors.textSecondary}
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={theme.colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChangeEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={styles.buttonText}>Update Email</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  form: {
    marginTop: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabledInput: {
    opacity: 0.6,
    color: theme.colors.textSecondary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
});
