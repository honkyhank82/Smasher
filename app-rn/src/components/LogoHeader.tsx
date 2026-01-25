import React from "react";
import { StyleSheet, View } from "react-native";

export const LogoHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoPlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 40, // Standard header height content
  },
  logoPlaceholder: {
    width: 150,
    height: 40,
    backgroundColor: "#4A90E2",
    borderRadius: 4,
  },
});
