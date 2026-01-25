import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { subscriptionService } from "../services/subscriptionService";
import { usePremium } from "../contexts/PremiumContext";

const PREMIUM_FEATURES = [
  {
    icon: "📸",
    title: "6 Photos",
    description: "Upload one more photo",
    free: "5 photos",
    premium: "6 photos",
  },
  {
    icon: "👀",
    title: "See ALL Profile Viewers",
    description: "View everyone who checked you out",
    free: "First 2 only",
    premium: "All unblurred",
  },
  {
    icon: "📍",
    title: "Extended Range",
    description: "Connect beyond your area",
    free: "10 miles",
    premium: "Unlimited",
  },
  {
    icon: "🔍",
    title: "Advanced Filters",
    description: "Find exactly who you want",
    free: "Basic",
    premium: "Advanced",
  },
  {
    icon: "🚀",
    title: "Profile Boost",
    description: "Get 10x more visibility",
    free: "❌",
    premium: "✅",
  },
  {
    icon: "🚫",
    title: "No Ads",
    description: "Ad-free experience",
    free: "Ads",
    premium: "No ads",
  },
  {
    icon: "✓✓",
    title: "Read Receipts",
    description: "See when messages are read",
    free: "❌",
    premium: "✅",
  },
  {
    icon: "⚡",
    title: "Priority Support",
    description: "Get help faster",
    free: "Standard",
    premium: "Priority",
  },
];

export const PremiumUpgradeScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const { refreshSubscriptionStatus } = usePremium();

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      // Create checkout session
      const { url } = await subscriptionService.createCheckoutSession(
        "smasher://premium/success",
        "smasher://premium/cancel",
      );

      // Open Stripe checkout in browser
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);

        // Show instructions
        Alert.alert(
          "Complete Your Purchase",
          "Complete the payment in your browser, then return to the app. Your premium features will activate immediately.",
          [
            {
              text: "I Completed Payment",
              onPress: async () => {
                await refreshSubscriptionStatus();
                navigation.goBack();
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ],
        );
      } else {
        Alert.alert("Error", "Could not open payment page");
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Could not start checkout process",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ Upgrade to Premium</Text>
        <Text style={styles.price}>$9.99/month</Text>
        <Text style={styles.subtitle}>Cancel anytime • No commitment</Text>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Premium Features</Text>

        {PREMIUM_FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Free</Text>
                <Text style={styles.comparisonValue}>{feature.free}</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Premium</Text>
                <Text style={[styles.comparisonValue, styles.premiumValue]}>
                  {feature.premium}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.benefitsContainer}>
        <Text style={styles.sectionTitle}>Why Upgrade?</Text>
        <Text style={styles.benefitText}>
          • Get 10x more profile views{"\n"}• Match with more people{"\n"}•
          Stand out from the crowd{"\n"}• Support app development{"\n"}• Unlock
          all features forever
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.upgradeButton, loading && styles.upgradeButtonDisabled]}
        onPress={handleUpgrade}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            <Text style={styles.upgradeButtonSubtext}>
              $9.99/month • Cancel anytime
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By subscribing, you agree to automatic monthly billing. You can cancel
          anytime from Settings. No refunds for partial months. Payment
          processed securely by Stripe.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Maybe Later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  price: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#8B0000",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
  },
  featuresContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  featureCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#999",
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  comparisonItem: {
    alignItems: "center",
  },
  comparisonLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  premiumValue: {
    color: "#8B0000",
  },
  benefitsContainer: {
    padding: 20,
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitText: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: "#8B0000",
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  upgradeButtonSubtext: {
    fontSize: 12,
    color: "#fff",
    marginTop: 4,
    opacity: 0.8,
  },
  termsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 30,
  },
  backButtonText: {
    fontSize: 16,
    color: "#999",
  },
});
