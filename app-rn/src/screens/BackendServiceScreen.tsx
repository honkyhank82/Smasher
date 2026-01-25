import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { theme } from "../config/theme";
import backendService from "../services/backendService";
import { BACKEND_SERVICES } from "../config/api";

interface BackendServiceScreenProps {
  navigation: any;
}

export const BackendServiceScreen = ({
  navigation,
}: BackendServiceScreenProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [checking, setChecking] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const currentService = await backendService.getSelectedService();
      setSelectedService(currentService);

      const availableServices = backendService.getAvailableServices();
      setServices(availableServices);
    } catch (error) {
      console.error("Error loading services:", error);
      Alert.alert("Error", "Failed to load backend services");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = async (serviceKey: string) => {
    if (serviceKey === selectedService) {
      return;
    }

    setChecking(serviceKey);
    try {
      // Check if the service is available
      const isAvailable =
        await backendService.checkServiceAvailability(serviceKey);

      if (isAvailable) {
        const success = await backendService.setActiveService(serviceKey);
        if (success) {
          setSelectedService(serviceKey);
          Alert.alert(
            "Service Changed",
            `Backend service changed to ${BACKEND_SERVICES[serviceKey].name}. The app will reload to apply changes.`,
            [
              {
                text: "OK",
                onPress: () => {
                  // In a real app, you might want to reload the app here
                  navigation.goBack();
                },
              },
            ],
          );
        } else {
          Alert.alert("Error", "Failed to change backend service");
        }
      } else {
        Alert.alert(
          "Service Unavailable",
          `${BACKEND_SERVICES[serviceKey].name} is currently unavailable. Would you like to try another service?`,
          [
            {
              text: "Try Another",
              onPress: handleTryNextService,
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ],
        );
      }
    } catch (error) {
      console.error("Error selecting service:", error);
      Alert.alert("Error", "Failed to select backend service");
    } finally {
      setChecking(null);
    }
  };

  const handleTryNextService = async () => {
    setLoading(true);
    try {
      const result = await backendService.switchToNextAvailableService();
      if (result.success) {
        setSelectedService(await backendService.getSelectedService());
        Alert.alert(
          "Service Changed",
          `Backend service changed to ${result.service.name}. The app will reload to apply changes.`,
          [
            {
              text: "OK",
              onPress: () => {
                // In a real app, you might want to reload the app here
                navigation.goBack();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "Error",
          result.message || "Failed to find available backend service",
        );
      }
    } catch (error) {
      console.error("Error trying next service:", error);
      Alert.alert("Error", "Failed to switch backend service");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading backend services...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Backend Services</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.description}>
        Select a backend service to use for the app. If one service is
        unavailable, you can try another.
      </Text>

      <View style={styles.serviceList}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.key}
            style={[
              styles.serviceItem,
              selectedService === service.key && styles.selectedService,
            ]}
            onPress={() => handleServiceSelect(service.key)}
            disabled={checking !== null}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceUrl}>{service.apiUrl}</Text>
            </View>
            {checking === service.key ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              selectedService === service.key && (
                <Text style={styles.selectedText}>✓</Text>
              )
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleTryNextService}
        disabled={checking !== null || loading}
      >
        <Text style={styles.buttonText}>Try Next Available Service</Text>
      </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    fontSize: 18,
    color: theme.colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    padding: 16,
    marginBottom: 10,
  },
  serviceList: {
    padding: 16,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: theme.colors.card,
  },
  selectedService: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 4,
  },
  serviceUrl: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  selectedText: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    margin: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BackendServiceScreen;
