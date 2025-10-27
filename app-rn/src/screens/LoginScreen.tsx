import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const LoginScreen = ({ onLoginSuccess, onBack }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!password || password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      console.log('🔑 Starting login...');
      await login(email, password);
      console.log('✅ Login successful, calling onLoginSuccess');
      // Auth context will handle navigation automatically
      onLoginSuccess();
      console.log('✅ onLoginSuccess called');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Provide detailed error information
      let displayMessage = 'Login failed';
      let title = 'Error';
      
      // Check for server unavailability (added for 502 errors)
      if (error.isServerUnavailable || error.response?.status === 502) {
        title = 'Server Unavailable';
        displayMessage = error.userFriendlyMessage || 'The server is currently unavailable. Would you like to try another backend service?';
      } else if (error.code === 'ECONNREFUSED') {
        displayMessage = 'Cannot connect to server. Check if backend is running and accessible.';
      } else if (error.code === 'ENOTFOUND') {
        displayMessage = 'Server domain not found. Check your API endpoint configuration.';
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        displayMessage = 'Connection timeout. Server is not responding quickly enough.';
      } else if (error.message?.includes('Network')) {
        displayMessage = 'Network error. Check your internet connection and firewall settings.';
      } else if (error.response?.status === 401) {
        displayMessage = 'Invalid email or password';
      } else if (error.response?.data?.message) {
        displayMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error.message) {
        displayMessage = error.message;
      }
      
      // Show error with retry option for server unavailability
      if (title === 'Server Unavailable') {
        Alert.alert(
          title,
          displayMessage,
          [
            {
              text: 'Switch Service',
              onPress: () => {
                setLoading(false);
                // Navigate to backend service selection
                onBack(); // Go back to previous screen where service selection might be available
              }
            },
            { 
              text: 'Try Again', 
              onPress: () => handleLogin() 
            },
            { 
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert(title, displayMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.logo}>SMASHER</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.disclaimer}>
        Log in with your email and password.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
  },
  content: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
