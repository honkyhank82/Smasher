import React from 'react';
import { Image, StyleSheet, View, Dimensions } from 'react-native';

export const LogoHeader = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40, // Standard header height content
  },
  logo: {
    width: 150, // Adjust based on logo aspect ratio
    height: 40,
  },
});
