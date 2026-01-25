import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { theme } from "../config/theme";
import api from "../services/api";
import { USE_MOCK_DATA, MOCK_PRIVACY_SETTINGS } from "../utils/mockData";

export const PrivacySettingsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    showLastSeen: true,
    showReadReceipts: true,
    allowProfileViewing: true,
    showDistance: true,
    discoverableInSearch: true,
  });

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      console.log("🔍 Loading privacy settings...");

      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        console.log("📦 Using mock data for privacy settings");
        await new Promise((resolve) => setTimeout(resolve, 500));
        setSettings(MOCK_PRIVACY_SETTINGS);
        console.log("✅ Mock privacy settings loaded:", MOCK_PRIVACY_SETTINGS);
        return;
      }

      const response = await api.get("/users/privacy-settings");
      console.log("✅ Privacy settings loaded:", response.data);
      setSettings(response.data);
    } catch (error: any) {
      console.error("❌ Failed to load privacy settings:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      Alert.alert(
        "Error Loading Settings",
        `Failed to load privacy settings: ${error.response?.data?.message || error.message}`,
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    const oldSettings = { ...settings };
    setSettings({ ...settings, [key]: value });

    setSaving(true);
    try {
      console.log("🔄 Updating privacy setting:", key, "=", value);
      await api.patch("/users/privacy-settings", {
        [key]: value,
      });
      console.log("✅ Privacy setting updated successfully");
    } catch (error: any) {
      console.error("❌ Failed to update privacy setting:", {
        key,
        value,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setSettings(oldSettings);
      Alert.alert(
        "Update Failed",
        `Failed to update setting: ${error.response?.data?.message || error.message}`,
        [{ text: "OK" }],
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Control who can see your information and how you appear to others.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibility</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Online Status</Text>
              <Text style={styles.settingDescription}>
                Let others see when you're online
              </Text>
            </View>
            <Switch
              value={settings.showOnlineStatus}
              onValueChange={(value) =>
                updateSetting("showOnlineStatus", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              disabled={saving}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Last Seen</Text>
              <Text style={styles.settingDescription}>
                Display when you were last active
              </Text>
            </View>
            <Switch
              value={settings.showLastSeen}
              onValueChange={(value) => updateSetting("showLastSeen", value)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              disabled={saving}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Distance</Text>
              <Text style={styles.settingDescription}>
                Display your distance from other users
              </Text>
            </View>
            <Switch
              value={settings.showDistance}
              onValueChange={(value) => updateSetting("showDistance", value)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              disabled={saving}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Allow Profile Viewing</Text>
              <Text style={styles.settingDescription}>
                Let others view your full profile
              </Text>
            </View>
            <Switch
              value={settings.allowProfileViewing}
              onValueChange={(value) =>
                updateSetting("allowProfileViewing", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              disabled={saving}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Discoverable in Search</Text>
              <Text style={styles.settingDescription}>
                Allow others to find you in search
              </Text>
            </View>
            <Switch
              value={settings.discoverableInSearch}
              onValueChange={(value) =>
                updateSetting("discoverableInSearch", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              disabled={saving}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Messages</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Read Receipts</Text>
              <Text style={styles.settingDescription}>
                Let others know when you've read their messages
              </Text>
            </View>
            <Switch
              value={settings.showReadReceipts}
              onValueChange={(value) =>
                updateSetting("showReadReceipts", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              disabled={saving}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
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
    padding: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "bold",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});
