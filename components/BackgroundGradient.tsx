import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/**
 * Quiet graphite wash behind the whole app: charcoal at the top fading into the
 * obsidian base. The cards stay flat, so the only gradient is this backdrop.
 */
export function BackgroundGradient() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="appBackground" x1="0" y1="0" x2="0.35" y2="1">
          <Stop offset="0" stopColor="#1E1F24" />
          <Stop offset="0.45" stopColor="#131317" />
          <Stop offset="1" stopColor="#0A0A0A" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#appBackground)" />
    </Svg>
  );
}
