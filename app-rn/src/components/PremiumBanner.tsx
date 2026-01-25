import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../config/theme";
import { usePremium } from "../contexts/PremiumContext";

export const PremiumBanner: React.FC = () => {
  const { isPremium, openUpgradeScreen } = usePremium();
  const [dismissed, setDismissed] = useState(false);

  if (isPremium || dismissed) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text} numberOfLines={2}>
        ✨ Go Premium: Unlimited photos/videos, see all viewers, advanced
        filters — $9.99/mo
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={openUpgradeScreen}
        >
          <Text style={styles.upgradeText}>Upgrade</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setDismissed(true)}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    backgroundColor: "#2a1a1a",
    borderColor: "#8B0000",
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  text: {
    flex: 1,
    color: "#fff",
    fontSize: theme.fontSize.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  upgradeButton: {
    backgroundColor: "#8B0000",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  upgradeText: {
    color: "#fff",
    fontSize: theme.fontSize.sm,
    fontWeight: "bold",
  },
  closeButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  closeText: {
    color: "#ccc",
    fontSize: theme.fontSize.md,
    lineHeight: theme.fontSize.md,
  },
});

export default PremiumBanner;
