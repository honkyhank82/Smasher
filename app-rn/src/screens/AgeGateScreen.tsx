import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { theme } from '../config/theme';

interface AgeGateScreenProps {
  onAgeVerified: (birthdate: string) => void;
}

export const AgeGateScreen = ({ onAgeVerified }: AgeGateScreenProps) => {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const calculateAge = (birthdate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleContinue = () => {
    if (!month || !day || !year) {
      Alert.alert('Error', 'Please enter your complete birthdate');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Error', 'You must agree to the Terms and Privacy Policy');
      return;
    }

    const birthdate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    if (isNaN(birthdate.getTime())) {
      Alert.alert('Error', 'Please enter a valid date');
      return;
    }

    const age = calculateAge(birthdate);
    
    if (age < 18) {
      Alert.alert(
        'Age Requirement',
        'You must be 18 or older to use this app.',
        [{ text: 'OK' }]
      );
      return;
    }

    const birthdateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    onAgeVerified(birthdateString);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>SMASHER</Text>
        <Text style={styles.subtitle}>18+ Only</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Enter Your Birthdate</Text>
        
        <View style={styles.dateInputs}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="MM"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            maxLength={2}
            value={month}
            onChangeText={setMonth}
          />
          <Text style={styles.dateSeparator}>/</Text>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="DD"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            maxLength={2}
            value={day}
            onChangeText={setDay}
          />
          <Text style={styles.dateSeparator}>/</Text>
          <TextInput
            style={[styles.input, styles.yearInput]}
            placeholder="YYYY"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            maxLength={4}
            value={year}
            onChangeText={setYear}
          />
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to the{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        By continuing, you confirm that you are 18 years or older and agree to our
        community guidelines.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoImage: {
    width: 250,
    height: 100,
    marginBottom: theme.spacing.sm,
  },
  logo: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  dateInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateInput: {
    flex: 1,
    textAlign: 'center',
  },
  yearInput: {
    flex: 1.5,
    textAlign: 'center',
  },
  dateSeparator: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.lg,
    marginHorizontal: theme.spacing.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
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
