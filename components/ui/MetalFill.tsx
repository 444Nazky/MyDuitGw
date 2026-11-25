import { Image, StyleSheet } from 'react-native';

/**
 * Brushed graphite artwork (#2C2C2E -> #141416) that fills its parent card.
 * The parent needs `relative overflow-hidden` so the gradient is clipped to the
 * rounded corners. Use it as the first child of a card container.
 */
export function MetalFill() {
  return (
    <Image
      source={require('../../assets/card-metal.png')}
      resizeMode="cover"
      style={StyleSheet.absoluteFill}
    />
  );
}
