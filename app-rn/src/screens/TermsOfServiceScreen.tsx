import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { theme } from "../config/theme";

export const TermsOfServiceScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: October 17, 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using SMASHER ("the App"), you accept and agree to be
          bound by the terms and provision of this agreement. If you do not
          agree to these terms, please do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be at least 18 years old to use this App. By using the App,
          you represent and warrant that you are at least 18 years of age and
          have the legal capacity to enter into this agreement.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your
          account and password. You agree to accept responsibility for all
          activities that occur under your account. You must notify us
          immediately of any unauthorized use of your account.
        </Text>

        <Text style={styles.sectionTitle}>4. User Conduct</Text>
        <Text style={styles.paragraph}>You agree not to use the App to:</Text>
        <Text style={styles.bulletPoint}>
          • Upload or transmit any content that is unlawful, harmful,
          threatening, abusive, harassing, defamatory, vulgar, obscene, or
          otherwise objectionable
        </Text>
        <Text style={styles.bulletPoint}>
          • Impersonate any person or entity or falsely state or misrepresent
          your affiliation with a person or entity
        </Text>
        <Text style={styles.bulletPoint}>
          • Engage in any form of harassment, stalking, or intimidation
        </Text>
        <Text style={styles.bulletPoint}>
          • Collect or store personal data about other users without their
          consent
        </Text>
        <Text style={styles.bulletPoint}>
          • Use the App for any commercial purposes without our prior written
          consent
        </Text>

        <Text style={styles.sectionTitle}>5. Content</Text>
        <Text style={styles.paragraph}>
          You retain all rights to the content you upload to the App. By
          uploading content, you grant SMASHER a worldwide, non-exclusive,
          royalty-free license to use, reproduce, modify, and distribute your
          content in connection with the App.
        </Text>

        <Text style={styles.sectionTitle}>6. Privacy</Text>
        <Text style={styles.paragraph}>
          Your use of the App is also governed by our Privacy Policy. Please
          review our Privacy Policy to understand our practices.
        </Text>

        <Text style={styles.sectionTitle}>7. Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to terminate or suspend your account at any time,
          without prior notice or liability, for any reason, including if you
          breach these Terms of Service.
        </Text>

        <Text style={styles.sectionTitle}>8. Disclaimers</Text>
        <Text style={styles.paragraph}>
          The App is provided "as is" and "as available" without warranties of
          any kind, either express or implied. We do not warrant that the App
          will be uninterrupted, secure, or error-free.
        </Text>

        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          In no event shall SMASHER be liable for any indirect, incidental,
          special, consequential, or punitive damages arising out of or relating
          to your use of the App.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. We will notify
          users of any material changes. Your continued use of the App after
          such modifications constitutes your acceptance of the updated terms.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms of Service, please contact
          us through the Help & Support section.
        </Text>

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "bold",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  lastUpdated: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  paragraph: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  bulletPoint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
  },
});
