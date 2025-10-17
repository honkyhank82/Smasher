import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { theme } from '../config/theme';
import api from '../config/api';

export const HelpSupportScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'account', label: 'Account Issues', icon: '👤' },
    { id: 'technical', label: 'Technical Problems', icon: '🔧' },
    { id: 'safety', label: 'Safety & Privacy', icon: '🛡️' },
    { id: 'billing', label: 'Billing & Payments', icon: '💳' },
    { id: 'report', label: 'Report User', icon: '⚠️' },
    { id: 'other', label: 'Other', icon: '💬' },
  ];

  const faqItems = [
    {
      question: 'How do I reset my password?',
      answer:
        'Go to Settings > Change Email, or use the "Forgot Password" link on the login screen.',
    },
    {
      question: 'How do I delete my account?',
      answer:
        'Go to Settings > Danger Zone > Delete Account. Your account will be scheduled for deletion after 30 days.',
    },
    {
      question: 'How do I block someone?',
      answer:
        "Visit their profile and tap the block button. You can manage blocked users in Settings > Blocked Users.",
    },
    {
      question: 'Why can\'t I see my matches?',
      answer:
        'Make sure you have location services enabled and your profile is complete. Check your privacy settings.',
    },
    {
      question: 'How do I report inappropriate content?',
      answer:
        'Tap the report button on any profile or message. Our team will review it within 24 hours.',
    },
  ];

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/support/ticket', {
        category: selectedCategory,
        message: message.trim(),
        contactEmail: email.trim() || undefined,
      });

      Alert.alert(
        'Support Request Sent',
        'Thank you for contacting us. Our team will respond within 24-48 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedCategory(null);
              setMessage('');
              setEmail('');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to submit support request:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send support request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqItems.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.xl }]}>
          Contact Support
        </Text>
        <Text style={styles.description}>
          Can't find what you're looking for? Send us a message and we'll get back to
          you.
        </Text>

        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelSelected,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Describe Your Issue *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Please provide as much detail as possible..."
          placeholderTextColor={theme.colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Contact Email (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="your.email@example.com"
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
          )}
        </TouchableOpacity>

        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Other Ways to Reach Us</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:support@smasher.app')}
          >
            <Text style={styles.contactLink}>📧 support@smasher.app</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  faqItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  faqQuestion: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  faqAnswer: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  categoryButton: {
    width: '48%',
    margin: '1%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  categoryLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  contactInfo: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  contactLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginVertical: theme.spacing.xs,
  },
});
