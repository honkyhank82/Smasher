import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../config/theme';

interface WelcomeScreenProps {
  onSignUp: () => void;
  onLogin: () => void;
}

export const WelcomeScreen = ({ onSignUp, onLogin }: WelcomeScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/welcome-image.png')} 
          style={styles.logoImage} 
          resizeMode="contain" 
        />
        <Text style={styles.tagline}>Connect with people nearby</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.signupButton} onPress={onSignUp}>
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.disclaimer}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 120,
    marginBottom: theme.spacing.md,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 3,
    marginBottom: theme.spacing.md,
  },
  tagline: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl * 2,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  signupButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  signupButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loginButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  disclaimer: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
