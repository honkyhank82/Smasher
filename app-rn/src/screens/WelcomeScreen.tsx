import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { theme } from '../config/theme';

interface WelcomeScreenProps {
  onSignUp: () => void;
  onLogin: () => void;
}

export const WelcomeScreen = ({ onSignUp, onLogin }: WelcomeScreenProps) => {
  return (
    <ImageBackground 
      source={require('../../assets/welcome-image.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Optional: Adds better text contrast
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Changed from flex-end or center to allow positioning
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto', // Push content down if needed, or keep centered
    marginBottom: 50,
  },
  // Removed logoImage style as it is no longer used
  tagline: {
    fontSize: theme.fontSize.xl, // Increased size for better visibility on background
    color: '#FFFFFF', // White text for better contrast on image
    marginBottom: theme.spacing.xl * 2,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
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
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
