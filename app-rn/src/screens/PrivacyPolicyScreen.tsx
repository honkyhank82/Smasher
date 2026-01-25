import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { theme } from "../config/theme";

export const PrivacyPolicyScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: October 17, 2025</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly to us, including:
        </Text>
        <Text style={styles.bulletPoint}>
          • Account information (email, password, date of birth)
        </Text>
        <Text style={styles.bulletPoint}>
          • Profile information (display name, bio, photos)
        </Text>
        <Text style={styles.bulletPoint}>
          • Location data (when you grant permission)
        </Text>
        <Text style={styles.bulletPoint}>
          • Messages and interactions with other users
        </Text>
        <Text style={styles.bulletPoint}>
          • Device information and usage data
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Provide, maintain, and improve our services
        </Text>
        <Text style={styles.bulletPoint}>
          • Match you with other users based on location and preferences
        </Text>
        <Text style={styles.bulletPoint}>
          • Send you notifications about matches and messages
        </Text>
        <Text style={styles.bulletPoint}>
          • Protect against fraud and abuse
        </Text>
        <Text style={styles.bulletPoint}>
          • Analyze usage patterns to improve user experience
        </Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal information. We may share your
          information:
        </Text>
        <Text style={styles.bulletPoint}>
          • With other users as part of the App's functionality (profile
          viewing, matching)
        </Text>
        <Text style={styles.bulletPoint}>
          • With service providers who assist in operating the App
        </Text>
        <Text style={styles.bulletPoint}>
          • When required by law or to protect our rights
        </Text>
        <Text style={styles.bulletPoint}>
          • In connection with a merger, sale, or acquisition
        </Text>

        <Text style={styles.sectionTitle}>4. Location Information</Text>
        <Text style={styles.paragraph}>
          We collect and use your location data to show you nearby users and
          enable location-based features. You can control location permissions
          through your device settings. Disabling location services may limit
          certain features.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your information for as long as your account is active or as
          needed to provide services. If you delete your account, we will delete
          your personal information within 30 days, except where we are required
          to retain it for legal purposes.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>You have the right to:</Text>
        <Text style={styles.bulletPoint}>
          • Access and update your personal information
        </Text>
        <Text style={styles.bulletPoint}>
          • Delete your account and associated data
        </Text>
        <Text style={styles.bulletPoint}>
          • Control privacy settings and visibility
        </Text>
        <Text style={styles.bulletPoint}>
          • Opt out of certain data collection
        </Text>
        <Text style={styles.bulletPoint}>• Request a copy of your data</Text>

        <Text style={styles.sectionTitle}>7. Security</Text>
        <Text style={styles.paragraph}>
          We implement reasonable security measures to protect your information.
          However, no method of transmission over the internet is 100% secure.
          We cannot guarantee absolute security of your data.
        </Text>

        <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our App is not intended for users under 18 years of age. We do not
          knowingly collect information from children under 18. If we become
          aware that a child under 18 has provided us with personal information,
          we will delete it.
        </Text>

        <Text style={styles.sectionTitle}>9. Cookies and Tracking</Text>
        <Text style={styles.paragraph}>
          We use cookies and similar tracking technologies to collect usage
          information and improve our services. You can control cookies through
          your device settings.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes by posting the new policy and updating the
          "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy or our data practices,
          please contact us through the Help & Support section.
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
