import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { theme } from "../config/theme";

interface AdminUserSummary {
  id: string;
  email: string;
  isAdmin: boolean;
  isPremium: boolean;
  accountStatus: string;
  createdAt?: string;
}

export const AdminScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [targetUser, setTargetUser] = useState<AdminUserSummary | null>(null);
  const [profileBio, setProfileBio] = useState("");
  const [mediaIdToDelete, setMediaIdToDelete] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const isAdmin = !!user?.isAdmin;

  const handleLoadByEmail = async () => {
    setError("");
    setActionMessage("");
    setTargetUser(null);
    if (!searchEmail.trim()) {
      return;
    }
    try {
      setLoading(true);
      const response = await api.get<AdminUserSummary | null>(
        "/users/admin/by-email",
        {
          params: { email: searchEmail.trim() },
        },
      );
      if (!response.data) {
        setError("No user found for that email");
        return;
      }
      setTargetUser(response.data);
      setProfileBio("");
    } catch (err: any) {
      console.error("Admin load by email error:", err);
      setError(err?.response?.data?.message || "Failed to load user by email");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadById = async () => {
    setError("");
    setActionMessage("");
    setTargetUser(null);
    if (!searchUserId.trim()) {
      return;
    }
    try {
      setLoading(true);
      const response = await api.get<AdminUserSummary | null>(
        `/users/admin/by-id/${encodeURIComponent(searchUserId.trim())}`,
      );
      if (!response.data) {
        setError("No user found for that ID");
        return;
      }
      setTargetUser(response.data);
      setProfileBio("");
    } catch (err: any) {
      console.error("Admin load by id error:", err);
      setError(err?.response?.data?.message || "Failed to load user by id");
    } finally {
      setLoading(false);
    }
  };

  const ensureTarget = () => {
    if (!targetUser) {
      setError("Load a user first");
      return false;
    }
    return true;
  };

  const callUserAction = async (path: string, body?: any) => {
    if (!ensureTarget()) {
      return;
    }
    setError("");
    setActionMessage("");
    try {
      setLoading(true);
      const response = await api.post(path, body || {});
      const msg = response?.data?.message || "Action completed";
      setActionMessage(msg);
    } catch (err: any) {
      console.error("Admin action error:", err);
      setError(err?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = () => {
    if (!targetUser) {
      return;
    }
    callUserAction(`/users/admin/deactivate/${targetUser.id}`);
  };

  const handleReactivate = () => {
    if (!targetUser) {
      return;
    }
    callUserAction(`/users/admin/reactivate/${targetUser.id}`);
  };

  const handleBan = () => {
    if (!targetUser) {
      return;
    }
    Alert.alert(
      "Ban User",
      "This will schedule the user account for deletion after the grace period. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Ban User",
          style: "destructive",
          onPress: () => callUserAction(`/users/admin/ban/${targetUser!.id}`),
        },
      ],
    );
  };

  const handleMakeAdmin = () => {
    if (!targetUser) {
      return;
    }
    callUserAction(`/users/admin/privileges/${targetUser.id}`, {
      isAdmin: true,
    });
  };

  const handleRemoveAdmin = () => {
    if (!targetUser) {
      return;
    }
    callUserAction(`/users/admin/privileges/${targetUser.id}`, {
      isAdmin: false,
    });
  };

  const handleUpdateProfile = async () => {
    if (!ensureTarget()) {
      return;
    }
    if (!profileBio.trim()) {
      setError(
        "Enter a replacement bio or text (can be empty string to clear)",
      );
      return;
    }
    setError("");
    setActionMessage("");
    try {
      setLoading(true);
      await api.patch(`/profiles/admin/${targetUser!.id}`, {
        bio: profileBio,
      });
      setActionMessage("Profile updated");
    } catch (err: any) {
      console.error("Admin update profile error:", err);
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!mediaIdToDelete.trim()) {
      setError("Enter a mediaId to delete");
      return;
    }
    setError("");
    setActionMessage("");
    try {
      setLoading(true);
      await api.post("/media/admin/delete", {
        mediaId: mediaIdToDelete.trim(),
      });
      setActionMessage("Media deleted");
    } catch (err: any) {
      console.error("Admin delete media error:", err);
      setError(err?.response?.data?.message || "Failed to delete media");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Admin</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Access Denied</Text>
          <Text style={styles.infoText}>
            You do not have permission to view this screen.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Lookup</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>By Email</Text>
          <TextInput
            style={styles.input}
            value={searchEmail}
            onChangeText={setSearchEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="user@example.com"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleLoadByEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Load</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>By User ID</Text>
          <TextInput
            style={styles.input}
            value={searchUserId}
            onChangeText={setSearchUserId}
            autoCapitalize="none"
            placeholder="UUID"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleLoadById}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Load</Text>
            )}
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {actionMessage ? (
          <Text style={styles.successText}>{actionMessage}</Text>
        ) : null}

        {targetUser && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>ID: {targetUser.id}</Text>
            <Text style={styles.infoText}>Email: {targetUser.email}</Text>
            <Text style={styles.infoText}>
              Admin: {targetUser.isAdmin ? "Yes" : "No"}
            </Text>
            <Text style={styles.infoText}>
              Premium: {targetUser.isPremium ? "Yes" : "No"}
            </Text>
            <Text style={styles.infoText}>
              Status: {targetUser.accountStatus}
            </Text>
          </View>
        )}
      </View>

      {targetUser && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Controls</Text>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={handleDeactivate}
                disabled={loading}
              >
                <Text style={styles.smallButtonText}>Deactivate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={handleReactivate}
                disabled={loading}
              >
                <Text style={styles.smallButtonText}>Reactivate</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={handleBan}
                disabled={loading}
              >
                <Text style={styles.smallButtonText}>Ban / Delete</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={handleMakeAdmin}
                disabled={loading}
              >
                <Text style={styles.smallButtonText}>Make Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={handleRemoveAdmin}
                disabled={loading}
              >
                <Text style={styles.smallButtonText}>Remove Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit Profile Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profileBio}
              onChangeText={setProfileBio}
              placeholder="Replacement bio text (set to something safe or empty to clear)"
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Bio</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delete Media by ID</Text>
            <TextInput
              style={styles.input}
              value={mediaIdToDelete}
              onChangeText={setMediaIdToDelete}
              placeholder="Media UUID"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleDeleteMedia}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Delete Media</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
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
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "bold",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  button: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
  },
  smallButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  smallButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  infoCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    marginBottom: 4,
  },
  errorText: {
    color: "#ff4444",
    marginTop: theme.spacing.sm,
  },
  successText: {
    color: "#4caf50",
    marginTop: theme.spacing.sm,
  },
});
