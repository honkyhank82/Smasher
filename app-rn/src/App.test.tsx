import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";

// Simple Smoke Test Component
const SmokeTestComponent = () => (
  <View>
    <Text>Smasher App</Text>
  </View>
);

describe("Smoke Test", () => {
  it("renders correctly", () => {
    const { getByText } = render(<SmokeTestComponent />);
    expect(getByText("Smasher App")).toBeTruthy();
  });
});
