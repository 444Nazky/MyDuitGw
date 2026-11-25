import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

/**
 * Ambient light behind the UI. Card surfaces are translucent, so this soft
 * gradient shows through them and reads as frosted glass.
 */
export function AmbientBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="glowViolet" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.34} />
            <Stop offset="55%" stopColor="#7C5CFF" stopOpacity={0.1} />
            <Stop offset="100%" stopColor="#7C5CFF" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#4F7CFF" stopOpacity={0.22} />
            <Stop offset="60%" stopColor="#4F7CFF" stopOpacity={0.07} />
            <Stop offset="100%" stopColor="#4F7CFF" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glowAmber" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFB020" stopOpacity={0.16} />
            <Stop offset="60%" stopColor="#FFB020" stopOpacity={0.05} />
            <Stop offset="100%" stopColor="#FFB020" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="52" cy="80" r="290" fill="url(#glowViolet)" />
        <Circle cx="362" cy="520" r="270" fill="url(#glowBlue)" />
        <Circle cx="30" cy="770" r="230" fill="url(#glowAmber)" />
      </Svg>
    </View>
  );
}
