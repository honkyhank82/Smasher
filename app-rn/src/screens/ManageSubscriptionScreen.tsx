import React, { useState, useEffect } from "react";
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

export const ManageSubscriptionScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { subscriptionStatus, refreshSubscriptionStatus, isPremium } =
    usePremium();
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    refreshSubscriptionStatus();
  }, [refreshSubscriptionStatus]);

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const { url } =
        await subscriptionService.createPortalSession("smasher://settings");

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Could not open subscription management page");
      }
    } catch (error: any) {
      console.error("Error opening portal:", error);
      Alert.alert("Error", "Could not open subscription management");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription?",
      "Your subscription will remain active until the end of your billing period. You can reactivate anytime before then.",
      [
        {
          text: "Keep Subscription",
          style: "cancel",
        },
        {
          text: "Cancel",
          style: "destructive",
          onPress: confirmCancel,
        },
      ],
    );
  };

  const confirmCancel = async () => {
    try {
      setIsProcessing(true);
      await subscriptionService.cancelSubscription();
      await refreshSubscriptionStatus();
      Alert.alert(
        "Subscription Canceled",
        "Your premium features will remain active until the end of your billing period.",
      );
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      Alert.alert("Error", "Could not cancel subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setIsProcessing(true);
      await subscriptionService.reactivateSubscription();
      await refreshSubscriptionStatus();
      Alert.alert(
        "Subscription Reactivated",
        "Your subscription will continue and renew automatically.",
      );
    } catch (error: any) {
      console.error("Error reactivating subscription:", error);
      Alert.alert("Error", "Could not reactivate subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <View style={styles.notPremiumContainer}>
          <Text style={styles.notPremiumTitle}>No Active Subscription</Text>
          <Text style={styles.notPremiumText}>
            You don't have an active premium subscription.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate("PremiumUpgrade")}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const subscription = subscriptionStatus?.subscription;
  const expiryDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
    : "N/A";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>✨ PREMIUM</Text>
        <Text style={styles.title}>Your Subscription</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Plan</Text>
          <Text style={styles.value}>Premium Monthly</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>
            ${subscription?.amount || "9.99"}/{subscription?.currency || "USD"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, styles.statusActive]}>
            {subscription?.status === "active"
              ? "Active"
              : subscription?.status}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>
            {subscription?.cancelAtPeriodEnd ? "Active Until" : "Renews On"}
          </Text>
          <Text style={styles.value}>{expiryDate}</Text>
        </View>
      </View>

      {subscription?.cancelAtPeriodEnd && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Subscription Ending</Text>
          <Text style={styles.warningText}>
            Your subscription is set to cancel on {expiryDate}. You'll lose
            access to premium features after this date.
          </Text>
          <TouchableOpacity
            style={styles.reactivateButton}
            onPress={handleReactivate}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.reactivateButtonText}>
                Reactivate Subscription
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Your Premium Benefits</Text>
        <Text style={styles.benefitItem}>✓ Unlimited messages</Text>
        <Text style={styles.benefitItem}>✓ See who viewed your profile</Text>
        <Text style={styles.benefitItem}>✓ Advanced search filters</Text>
        <Text style={styles.benefitItem}>✓ 6 photos on your profile</Text>
        <Text style={styles.benefitItem}>✓ Profile boost (10x visibility)</Text>
        <Text style={styles.benefitItem}>✓ No ads</Text>
        <Text style={styles.benefitItem}>✓ Read receipts</Text>
        <Text style={styles.benefitItem}>✓ Priority support</Text>
      </View>

      <TouchableOpacity
        style={styles.manageButton}
        onPress={handleManageSubscription}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.manageButtonText}>Manage Payment Method</Text>
        )}
      </TouchableOpacity>

      {!subscription?.cancelAtPeriodEnd && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelSubscription}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#8B0000" />
          ) : (
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Billing Information</Text>
        <Text style={styles.infoText}>
          • Billed monthly on the same day{"\n"}• Automatic renewal{"\n"}•
          Cancel anytime, no penalties{"\n"}• Access until end of billing period
          {"\n"}• Secure payment via Stripe
        </Text>
      </View>
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
  },
  badge: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8B0000",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  label: {
    fontSize: 15,
    color: "#999",
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  statusActive: {
    color: "#4CAF50",
  },
  warningCard: {
    backgroundColor: "#2a1a1a",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#8B0000",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
    marginBottom: 15,
  },
  reactivateButton: {
    backgroundColor: "#8B0000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  reactivateButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  benefitsCard: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  benefitItem: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 8,
  },
  manageButton: {
    backgroundColor: "#8B0000",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "transparent",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#8B0000",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B0000",
  },
  infoCard: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#999",
    lineHeight: 22,
  },
  notPremiumContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  notPremiumTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  notPremiumText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
  },
  upgradeButton: {
    backgroundColor: "#8B0000",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
